// Logique de synchronisation des données hors ligne avec Supabase
import { createClient } from '@/lib/supabase/client';
import { offlineStorage } from './storage';

export class OfflineSync {
  private syncing = false;

  // Synchroniser toutes les actions en attente
  async syncPendingActions(): Promise<void> {
    if (this.syncing) return;
    if (offlineStorage.isOffline()) return;

    this.syncing = true;
    const supabase = createClient();
    const pendingActions = await offlineStorage.getPendingActions();

    try {
      for (const action of pendingActions) {
        try {
          if (action.type === 'create') {
            const { error } = await supabase
              .from(action.table)
              .insert(action.data);
            
            if (!error) {
              await offlineStorage.removePendingAction(action.id);
            }
          } else if (action.type === 'update') {
            const { error } = await supabase
              .from(action.table)
              .update(action.data)
              .eq('id', action.data.id);
            
            if (!error) {
              await offlineStorage.removePendingAction(action.id);
            }
          } else if (action.type === 'delete') {
            const { error } = await supabase
              .from(action.table)
              .delete()
              .eq('id', action.data.id);
            
            if (!error) {
              await offlineStorage.removePendingAction(action.id);
            }
          }
        } catch (error) {
          console.error(`Erreur synchronisation action ${action.id}:`, error);
          // Continuer avec les autres actions
        }
      }
    } finally {
      this.syncing = false;
    }
  }

  // Synchroniser automatiquement quand la connexion revient
  startAutoSync(): void {
    if (typeof window === 'undefined') return;

    // Synchroniser immédiatement si en ligne
    if (navigator.onLine) {
      this.syncPendingActions().catch(console.error);
    }

    // Écouter les événements de connexion
    const handleOnline = async () => {
      console.log('Connexion rétablie, synchronisation en cours...');
      await this.syncPendingActions();
    };
    
    window.addEventListener('online', handleOnline);
  }
}

export const offlineSync = new OfflineSync();
