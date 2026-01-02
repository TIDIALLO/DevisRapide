// Gestion du stockage hors ligne avec IndexedDB
// Permet de sauvegarder les données localement et de les synchroniser plus tard

const DB_NAME = 'devisrapide-offline';
const DB_VERSION = 1;

interface OfflineData {
  quotes: any[];
  clients: any[];
  catalogItems: any[];
  pendingActions: Array<{
    type: 'create' | 'update' | 'delete';
    table: string;
    data: any;
    timestamp: number;
  }>;
}

export class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les devis
        if (!db.objectStoreNames.contains('quotes')) {
          db.createObjectStore('quotes', { keyPath: 'id' });
        }

        // Store pour les clients
        if (!db.objectStoreNames.contains('clients')) {
          db.createObjectStore('clients', { keyPath: 'id' });
        }

        // Store pour le catalogue
        if (!db.objectStoreNames.contains('catalogItems')) {
          db.createObjectStore('catalogItems', { keyPath: 'id' });
        }

        // Store pour les actions en attente
        if (!db.objectStoreNames.contains('pendingActions')) {
          const actionStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Sauvegarder un devis localement
  async saveQuote(quote: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quotes'], 'readwrite');
      const store = transaction.objectStore('quotes');
      const request = store.put(quote);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer tous les devis locaux
  async getQuotes(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quotes'], 'readonly');
      const store = transaction.objectStore('quotes');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Sauvegarder un client localement
  async saveClient(client: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['clients'], 'readwrite');
      const store = transaction.objectStore('clients');
      const request = store.put(client);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer tous les clients locaux
  async getClients(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['clients'], 'readonly');
      const store = transaction.objectStore('clients');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Sauvegarder un article de catalogue localement
  async saveCatalogItem(item: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['catalogItems'], 'readwrite');
      const store = transaction.objectStore('catalogItems');
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer tous les articles de catalogue locaux
  async getCatalogItems(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['catalogItems'], 'readonly');
      const store = transaction.objectStore('catalogItems');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Ajouter une action en attente de synchronisation
  async addPendingAction(action: {
    type: 'create' | 'update' | 'delete';
    table: string;
    data: any;
  }): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.add({
        ...action,
        timestamp: Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer toutes les actions en attente
  async getPendingActions(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const index = store.index('timestamp');
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Supprimer une action après synchronisation
  async removePendingAction(id: number): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sauvegarder un brouillon de devis
  async saveDraft(draft: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quotes'], 'readwrite');
      const store = transaction.objectStore('quotes');
      // Utiliser un ID temporaire si pas d'ID
      const draftWithId = { ...draft, id: draft.id || `draft-${Date.now()}` };
      const request = store.put(draftWithId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Vérifier si on est en mode hors ligne
  isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }
}

export const offlineStorage = new OfflineStorage();
