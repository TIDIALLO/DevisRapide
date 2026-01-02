'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Search, Check, Phone, Mail, MapPin } from 'lucide-react';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  onSelect: (clientId: string) => void;
  onCreateNew: (clientData: {
    full_name: string;
    phone: string;
    email?: string;
    address?: string;
  }) => Promise<void>;
}

export function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
  onCreateNew,
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [creating, setCreating] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.full_name?.toLowerCase().includes(query) ||
        client.phone?.includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.address?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const handleCreateClient = async () => {
    if (!newClientData.full_name || !newClientData.phone) {
      return;
    }

    setCreating(true);
    try {
      await onCreateNew(newClientData);
      setShowCreateDialog(false);
      setNewClientData({ full_name: '', phone: '', email: '', address: '' });
      setSearchQuery('');
    } catch (error) {
      console.error('Erreur création client:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Client</Label>
        {selectedClient ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-base">{selectedClient.full_name}</div>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  {selectedClient.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedClient.phone}
                    </div>
                  )}
                  {selectedClient.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedClient.email}
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedClient.address}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="ml-2"
              >
                Modifier
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsOpen(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            Sélectionner un client
          </Button>
        )}
      </div>

      {/* Client Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Sélectionner un client</DialogTitle>
            <DialogDescription>
              Recherchez un client existant ou créez-en un nouveau
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, téléphone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      onSelect(client.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full text-left p-4 border rounded-lg transition-colors hover:bg-gray-50',
                      selectedClientId === client.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{client.full_name}</div>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          )}
                          {client.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {client.address}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedClientId === client.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun client trouvé</p>
                  <p className="text-sm mt-1">
                    {searchQuery ? 'Essayez une autre recherche' : 'Créez votre premier client'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Client Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
            <DialogDescription>Créez un nouveau client rapidement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input
                value={newClientData.full_name}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, full_name: e.target.value })
                }
                placeholder="Ex: Fatou Seck"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input
                value={newClientData.phone}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, phone: e.target.value })
                }
                placeholder="+221 77 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newClientData.email}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={newClientData.address}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, address: e.target.value })
                }
                placeholder="Dakar, Sénégal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewClientData({ full_name: '', phone: '', email: '', address: '' });
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={!newClientData.full_name || !newClientData.phone || creating}
            >
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
