'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Plus, Search, Phone, Mail, MapPin, Edit, Trash2, User } from 'lucide-react';
import type { Client } from '@/types';
import { useToast } from '@/components/ui/toast';

export default function ClientsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/connexion');
        return;
      }

      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        full_name: client.full_name,
        phone: client.phone,
        email: client.email || '',
        address: client.address || '',
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Vérifier que les champs requis sont remplis
      if (!formData.full_name || !formData.phone) {
        addToast({
          type: 'warning',
          title: 'Champs obligatoires',
          description: 'Le nom complet et le téléphone sont obligatoires.',
        });
        return;
      }

      // 1. Vérifier et rafraîchir la session
      // Utiliser getUser() qui force un refresh de la session depuis le serveur
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erreur utilisateur:', userError);
        console.error('User:', user);
        addToast({
          type: 'error',
          title: 'Session expirée',
          description: 'Votre session a expiré. Veuillez vous reconnecter.',
        });
        router.push('/connexion');
        return;
      }

      // 2. Vérifier la session également pour s'assurer qu'elle est valide
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Erreur session:', sessionError);
        console.error('Session:', session);
        // Si getUser() a réussi mais getSession() échoue, forcer un refresh
        addToast({
          type: 'error',
          title: 'Problème de session',
          description: 'Veuillez vous reconnecter.',
        });
        router.push('/connexion');
        return;
      }

      // 3. Vérifier que les IDs correspondent
      if (session.user.id !== user.id) {
        console.error('IDs ne correspondent pas:', {
          sessionUserId: session.user.id,
          getUserUserId: user.id,
        });
        addToast({
          type: 'error',
          title: 'Erreur de session',
          description: 'Les identifiants ne correspondent pas. Veuillez vous reconnecter.',
        });
        router.push('/connexion');
        return;
      }

      console.log('✅ Session valide - User ID:', user.id);
      
      // 4. Vérifier que les cookies de session sont présents
      const cookies = document.cookie.split('; ').map(c => c.split('=')[0]);
      const hasAuthCookie = cookies.some(c => c.includes('sb-') && c.includes('auth-token'));
      console.log('Cookies présents:', cookies.filter(c => c.includes('sb-')));
      console.log('Cookie auth présent:', hasAuthCookie);
      
      if (!hasAuthCookie) {
        console.warn('⚠️ Aucun cookie de session Supabase détecté. La session peut ne pas être transmise correctement.');
      }

      // 4. Vérifier que la session est bien transmise à Supabase
      // On fait une requête simple pour tester RLS (mais on ne bloque pas si ça échoue)
      // car le test peut échouer pour d'autres raisons (table vide, etc.)
      const { error: testError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (testError) {
        console.warn('⚠️ Test RLS:', testError.message);
        // Si c'est une erreur RLS explicite, on avertit mais on continue quand même
        // car l'insertion peut fonctionner même si le SELECT échoue
        if (testError.code === '42501' || testError.code === 'PGRST301') {
          console.warn('⚠️ Erreur RLS détectée lors du test, mais on continue quand même');
        }
      } else {
        console.log('✅ Test RLS réussi - La session est correctement transmise');
      }

      if (editingClient) {
        // Mise à jour - S'assurer que user_id est inclus pour RLS
        const updateData = {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || null,
          address: formData.address?.trim() || null,
          notes: formData.notes?.trim() || null,
        };

        console.log('Mise à jour client:', { id: editingClient.id, data: updateData });

        const { data: updatedClient, error } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', editingClient.id)
          .eq('user_id', user.id) // S'assurer que c'est bien le client de l'utilisateur
          .select()
          .single();

        if (error) {
          console.error('Erreur mise à jour client:', error);
          if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
            throw new Error('🔒 Erreur de sécurité : Vous n\'avez pas la permission de modifier ce client.');
          }
          throw error;
        }

        if (!updatedClient) {
          throw new Error('Le client n\'a pas été mis à jour. Vérifiez que vous avez les permissions nécessaires.');
        }

        console.log('✅ Client mis à jour avec succès:', updatedClient);
        addToast({
          type: 'success',
          title: 'Client modifié',
          description: `${updatedClient.full_name} a été mis à jour avec succès.`,
        });
      } else {
        // Création - S'assurer que user_id correspond exactement à auth.uid()
        const clientData = {
          user_id: user.id, // Doit correspondre à auth.uid() pour que RLS accepte
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || null,
          address: formData.address?.trim() || null,
          notes: formData.notes?.trim() || null,
        };

        console.log('Création client avec user_id:', user.id);
        console.log('Données client:', clientData);
        
        // Vérifier une dernière fois la session avant l'insertion
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (!finalSession || finalSession.user.id !== user.id) {
          console.error('❌ Session invalide au moment de l\'insertion');
          addToast({
            type: 'error',
            title: 'Session expirée',
            description: 'Votre session a expiré. Veuillez vous reconnecter.',
          });
          router.push('/connexion');
          return;
        }
        
        console.log('✅ Session confirmée avant insertion - User ID:', finalSession.user.id);
        
        const { data, error } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (error) {
          console.error('Erreur création client:', error);
          console.error('Détails:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          
          // Messages d'erreur plus spécifiques
          if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
            throw new Error('🔒 Erreur de sécurité : Votre session n\'est pas valide. Veuillez vous déconnecter et vous reconnecter.');
          }
          if (error.message?.includes('duplicate') || error.code === '23505') {
            throw new Error('📧 Ce client existe déjà (même nom ou téléphone).');
          }
          throw error;
        }

        console.log('Client créé avec succès:', data);
        addToast({
          type: 'success',
          title: 'Client créé',
          description: `${data.full_name} a été ajouté avec succès.`,
        });
      }

      setDialogOpen(false);
      setEditingClient(null);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
      await loadClients();
    } catch (error: any) {
      console.error('Erreur complète:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la sauvegarde du client.',
      });
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`Supprimer le client ${client.full_name} ?`)) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;
      
      addToast({
        type: 'success',
        title: 'Client supprimé',
        description: `${client.full_name} a été supprimé.`,
      });
      
      await loadClients();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de suppression',
        description: error.message || 'Une erreur est survenue lors de la suppression.',
      });
    }
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-gray-600 mt-1">{clients.length} client(s) enregistré(s)</p>
          </div>
          <Button onClick={() => handleOpenDialog()} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients List */}
        {filteredClients.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{client.full_name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(client)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'Aucun client trouvé' : 'Aucun client'}
              </p>
              <p className="mb-4">
                {searchQuery
                  ? 'Essayez une autre recherche'
                  : 'Ajoutez votre premier client pour commencer'}
              </p>
              {!searchQuery && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un client
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ex: Fatou Seck"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex: +221 77 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: fatou@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes personnelles..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.full_name || !formData.phone}
            >
              {editingClient ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

