'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Search, Check, Phone, Mail, MapPin, User, ChevronDown, X } from 'lucide-react';
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
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur création client:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (clientId: string) => {
    onSelect(clientId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-base font-semibold text-gray-900">Client *</Label>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between h-12 text-base font-medium",
                !selectedClient && "text-gray-500"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedClient ? (
                  <>
                    <User className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="truncate">{selectedClient.full_name}</span>
                    {selectedClient.phone && (
                      <span className="text-sm text-gray-500 hidden sm:inline">
                        • {selectedClient.phone}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Sélectionner un client</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedClient && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect('');
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] max-w-sm p-0 shadow-xl border-2 bg-white rounded-lg" 
            align="start"
          >
            <div className="flex flex-col max-h-[400px] bg-white">
              {/* Search */}
              <div className="p-3 border-b border-gray-200 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Rechercher un client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Client List */}
              <div className="overflow-y-auto max-h-[300px] custom-scrollbar bg-white">
                {filteredClients.length > 0 ? (
                  <div className="p-2">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelect(client.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between gap-2 mb-1",
                          selectedClientId === client.id
                            ? "bg-primary/15 text-primary font-semibold border-2 border-primary/40 shadow-sm"
                            : "hover:bg-primary/5 hover:border-primary/20 border-2 border-transparent hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                            selectedClientId === client.id
                              ? "bg-primary text-white shadow-sm"
                              : "bg-primary/10 text-primary"
                          )}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">{client.full_name}</div>
                            <div className="text-xs text-gray-600 truncate mt-0.5">
                              {client.phone}
                              {client.email && ` • ${client.email}`}
                            </div>
                          </div>
                        </div>
                        {selectedClientId === client.id && (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 bg-white">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium mb-1 text-gray-700">
                      {searchQuery ? 'Aucun client trouvé' : 'Aucun client'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {searchQuery ? 'Essayez une autre recherche' : 'Créez votre premier client'}
                    </p>
                  </div>
                )}
              </div>

              {/* Create Button */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateDialog(true);
                  }}
                  className="w-full font-semibold shadow-sm hover:shadow-md transition-shadow"
                  size="sm"
                  variant="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un nouveau client
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Selected Client Info (optional, shown below dropdown) */}
        {selectedClient && (
          <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 mb-1">
                  {selectedClient.full_name}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {selectedClient.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedClient.phone}
                    </div>
                  )}
                  {selectedClient.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{selectedClient.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Client Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Nouveau client</DialogTitle>
            <DialogDescription>
              Créez un nouveau client rapidement. Les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nom complet *</Label>
              <Input
                value={newClientData.full_name}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, full_name: e.target.value })
                }
                placeholder="Ex: Fatou Seck"
                className="h-10"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Téléphone *</Label>
              <Input
                value={newClientData.phone}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, phone: e.target.value })
                }
                placeholder="+221 77 123 45 67"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Email</Label>
              <Input
                type="email"
                value={newClientData.email}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, email: e.target.value })
                }
                placeholder="email@example.com"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Adresse</Label>
              <Input
                value={newClientData.address}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, address: e.target.value })
                }
                placeholder="Dakar, Sénégal"
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
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
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
