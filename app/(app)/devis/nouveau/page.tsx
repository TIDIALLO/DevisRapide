'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Search, Save, Send, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Client, CatalogItem } from '@/types';
import { useToast } from '@/components/ui/toast';
import { ClientSelector } from '@/components/clients/client-selector';
import { offlineStorage } from '@/lib/offline/storage';
import { canCreateQuote } from '@/lib/freemium/limits';

interface QuoteItem {
  id: string;
  catalog_item_id?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

function parseError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  return e?.message || e?.details || 'Une erreur est survenue.';
}

function LoadingSkeleton() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-6 animate-pulse">
        <div>
          <div className="h-9 bg-gray-200 rounded-lg w-52 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-72" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default function NewQuotePage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [documentType, setDocumentType] = useState<'devis' | 'facture'>('devis');
  const [serviceDescription, setServiceDescription] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState('0');
  const [taxRate, setTaxRate] = useState('0');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');

  const [showItemDialog, setShowItemDialog] = useState(false);
  const [searchCatalog, setSearchCatalog] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/connexion'); return; }
      setUser(authUser);

      await offlineStorage.init();
      const isOnline = navigator.onLine;

      const { data: profile } = await supabase
        .from('users').select('default_payment_terms').eq('id', authUser.id).single();
      if (profile?.default_payment_terms) setPaymentTerms(profile.default_payment_terms);

      if (isOnline) {
        const [{ data: clientsData }, { data: catalogData }] = await Promise.all([
          supabase.from('clients').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
          supabase.from('catalog_items').select('*').eq('user_id', authUser.id).order('name'),
        ]);
        if (clientsData) {
          setClients(clientsData);
          await Promise.all(clientsData.map(c => offlineStorage.saveClient(c)));
        }
        if (catalogData) {
          setCatalogItems(catalogData);
          await Promise.all(catalogData.map(i => offlineStorage.saveCatalogItem(i)));
        }
      } else {
        const [cachedClients, cachedCatalog] = await Promise.all([
          offlineStorage.getClients(),
          offlineStorage.getCatalogItems(),
        ]);
        const userClients = cachedClients.filter(c => c.user_id === authUser.id);
        const userCatalog = cachedCatalog.filter(i => i.user_id === authUser.id);
        if (userClients.length > 0) {
          setClients(userClients);
          addToast({ type: 'info', title: 'Mode hors ligne', description: 'Données depuis le cache local.' });
        }
        if (userCatalog.length > 0) setCatalogItems(userCatalog);
      }
    } catch {
      addToast({ type: 'error', title: 'Erreur', description: 'Impossible de charger les données.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (clientData: {
    full_name: string;
    phone: string;
    email?: string;
    address?: string;
  }) => {
    if (!clientData.full_name || !clientData.phone) {
      addToast({ type: 'warning', title: 'Champs obligatoires', description: 'Nom et téléphone requis.' });
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser || currentUser.id !== user?.id) {
        router.push('/connexion');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({ user_id: currentUser.id, ...clientData })
        .select()
        .single();

      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error as any)?.code as string;
        if (code === '23505') throw new Error('Ce client existe déjà (même nom ou téléphone).');
        throw new Error(parseError(error));
      }
      if (!data) throw new Error('Client non créé. Aucune donnée retournée.');

      setClients(prev => [data, ...prev]);
      setSelectedClientId(data.id);
      addToast({ type: 'success', title: 'Client créé', description: `${data.full_name} ajouté.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Erreur de création', description: parseError(err) });
    }
  };

  const handleAddCatalogItem = (catalogItem: CatalogItem) => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      catalog_item_id: catalogItem.id,
      name: catalogItem.name,
      description: catalogItem.description || '',
      quantity: 1,
      unit: catalogItem.unit,
      unit_price: catalogItem.unit_price,
      amount: catalogItem.unit_price,
    }]);
    setShowItemDialog(false);
    setSearchCatalog('');
  };

  const handleAddCustomItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'pièce',
      unit_price: 0,
      amount: 0,
    }]);
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.amount = updated.quantity * updated.unit_price;
      }
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discountType === 'none' ? 0
    : discountType === 'percent' ? (subtotal * parseFloat(discountValue || '0')) / 100
    : parseFloat(discountValue || '0');
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * parseFloat(taxRate || '0')) / 100;
  const total = afterDiscount + taxAmount;

  const generateQuoteNumberManually = async (userId: string): Promise<string> => {
    try {
      const { data: existingQuotes } = await supabase
        .from('quotes').select('quote_number').eq('user_id', userId);

      const existingNumbers = new Set(
        (existingQuotes || [])
          .map(q => q.quote_number)
          .filter((n): n is string => typeof n === 'string' && n.startsWith('DEV-'))
          .map(n => { const m = n.match(/DEV-(\d+)/); return m ? parseInt(m[1], 10) : null; })
          .filter((n): n is number => n !== null)
      );

      let nextNumber = 1;
      while (existingNumbers.has(nextNumber)) nextNumber++;
      return `DEV-${String(nextNumber).padStart(3, '0')}`;
    } catch {
      return `DEV-${Date.now().toString().slice(-6)}`;
    }
  };

  const createQuote = async (quoteNumber: string, status: 'draft' | 'sent'): Promise<void> => {
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) throw new Error('Session expirée. Veuillez vous reconnecter.');

    const { data: existing } = await supabase
      .from('quotes').select('id').eq('user_id', currentUser.id).eq('quote_number', quoteNumber).maybeSingle();

    const finalQuoteNumber = existing ? await generateQuoteNumberManually(currentUser.id) : quoteNumber;

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        user_id: currentUser.id,
        client_id: selectedClientId,
        quote_number: finalQuoteNumber,
        status,
        document_type: documentType,
        service_description: serviceDescription || null,
        date: quoteDate,
        valid_until: validUntil,
        subtotal,
        discount_type: discountType === 'none' ? null : discountType,
        discount_value: discountType === 'none' ? null : parseFloat(discountValue),
        discount_amount: discountAmount,
        tax_rate: parseFloat(taxRate),
        tax_amount: taxAmount,
        total,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (quoteError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (quoteError as any)?.code as string;
      if (code === '23505') return createQuote(await generateQuoteNumberManually(currentUser.id), status);
      if (code === '42501') throw new Error('Erreur de sécurité RLS. Contactez le support.');
      if (code === '23503') throw new Error('Le client sélectionné est introuvable.');
      throw new Error(parseError(quoteError));
    }
    if (!quote) throw new Error('Devis non créé. Aucune donnée retournée.');

    const { error: itemsError } = await supabase.from('quote_items').insert(
      items.map((item, index) => ({
        quote_id: quote.id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        amount: item.amount,
        order: index,
      }))
    );
    if (itemsError) throw new Error(parseError(itemsError));

    try { await offlineStorage.saveQuote(quote); } catch { /* cache non-critique */ }

    router.push(`/devis/${quote.id}`);
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!user || !selectedClientId || items.length === 0) {
      addToast({ type: 'warning', title: 'Informations manquantes', description: 'Sélectionnez un client et ajoutez au moins un article.' });
      return;
    }

    const quoteLimit = await canCreateQuote(user.id);
    if (!quoteLimit.allowed) {
      addToast({ type: 'error', title: 'Limite atteinte', description: quoteLimit.message, duration: 8000 });
      return;
    }

    setSaving(true);

    try {
      if (!navigator.onLine) {
        await offlineStorage.saveDraft({
          id: `draft-${Date.now()}`,
          user_id: user.id,
          selectedClientId,
          documentType,
          serviceDescription,
          quoteDate,
          validUntil,
          items,
          discountType,
          discountValue,
          taxRate,
          paymentTerms,
          notes,
          status,
          timestamp: Date.now(),
        });
        addToast({ type: 'success', title: 'Brouillon sauvegardé', description: 'Synchronisé automatiquement à la reconnexion.' });
        return;
      }

      let quoteNumber: string;
      try {
        const { data, error } = await supabase.rpc('generate_quote_number', { p_user_id: user.id });
        quoteNumber = (!error && data) ? data : await generateQuoteNumberManually(user.id);
      } catch {
        quoteNumber = await generateQuoteNumberManually(user.id);
      }

      await createQuote(quoteNumber, status);
    } catch (err) {
      addToast({ type: 'error', title: 'Erreur', description: parseError(err) });
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalogItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-6">
        <div>
          <h1 className="text-3xl font-bold">Nouveau devis</h1>
          <p className="text-gray-600 mt-1">Créez un devis professionnel en quelques minutes</p>
        </div>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              Client et Type de document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClientSelector
              clients={clients}
              selectedClientId={selectedClientId}
              onSelect={setSelectedClientId}
              onCreateNew={handleCreateClient}
            />
            <div className="space-y-2">
              <Label>Type de document</Label>
              <Select value={documentType} onValueChange={(v: 'devis' | 'facture') => setDocumentType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="devis">Devis (avant service)</SelectItem>
                  <SelectItem value="facture">Facture (après service)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date du {documentType === 'devis' ? 'devis' : 'facture'}</Label>
                <Input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{documentType === 'devis' ? "Valide jusqu'au" : "Date d'échéance"}</Label>
                <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                Articles / Services
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowItemDialog(true)}>
                  <Search className="w-4 h-4 mr-2" />Catalogue
                </Button>
                <Button variant="default" size="sm" onClick={handleAddCustomItem} className="font-semibold">
                  <Plus className="w-4 h-4 mr-2" />Ajouter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Nom de l'article/service"
                        value={item.name}
                        onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optionnel)"
                        value={item.description}
                        onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                        rows={2}
                      />
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0" step="0.01"
                        />
                        <Input
                          placeholder="Unité"
                          value={item.unit}
                          onChange={e => handleUpdateItem(item.id, 'unit', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Prix unit."
                          value={item.unit_price}
                          onChange={e => handleUpdateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0" step="1"
                        />
                        <div className="flex items-center justify-end font-semibold text-sm">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun article ajouté</p>
                <p className="text-sm mt-1">Cliquez sur &ldquo;Catalogue&rdquo; ou &ldquo;Ajouter&rdquo; pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
              Calculs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span>Sous-total :</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="space-y-2">
              <Label>Remise (optionnel)</Label>
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v: 'none' | 'percent' | 'fixed') => setDiscountType(v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="fixed">FCFA</SelectItem>
                  </SelectContent>
                </Select>
                {discountType !== 'none' && (
                  <Input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Montant" min="0" />
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Remise appliquée :</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>TVA (optionnel)</Label>
              <Select value={taxRate} onValueChange={setTaxRate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (pas de TVA)</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                </SelectContent>
              </Select>
              {taxAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>TVA ({taxRate}%) :</span>
                  <span>+ {formatCurrency(taxAmount)}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-2xl font-bold text-primary">
                <span>TOTAL :</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
              Informations complémentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Conditions de paiement</Label>
              <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Ex: Paiement à 30 jours. Acompte de 30% requis." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Notes additionnelles</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes ou remarques..." rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-20 lg:bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button variant="outline" className="flex-1" onClick={() => handleSave('draft')} disabled={saving}>
            {saving ? <span className="animate-spin w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full inline-block" /> : <Save className="w-4 h-4 mr-2" />}
            Brouillon
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => addToast({ type: 'info', title: 'Prévisualisation', description: 'Fonctionnalité à venir.' })} disabled={saving}>
            <Eye className="w-4 h-4 mr-2" />Prévisualiser
          </Button>
          <Button className="flex-1" onClick={() => handleSave('sent')} disabled={saving}>
            {saving ? <span className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full inline-block" /> : <Send className="w-4 h-4 mr-2" />}
            Créer et envoyer
          </Button>
        </div>
      </div>

      {/* Catalog Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Sélectionner dans le catalogue</DialogTitle>
            <DialogDescription>Choisissez un article de votre catalogue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="relative sticky top-0 bg-white z-10 pb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher un article..."
                value={searchCatalog}
                onChange={e => setSearchCatalog(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              {filteredCatalogItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddCatalogItem(item)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                  <div className="text-sm text-primary font-semibold mt-1">
                    {formatCurrency(item.unit_price)}/{item.unit}
                  </div>
                </button>
              ))}
              {filteredCatalogItems.length === 0 && (
                <div className="text-center py-8 text-gray-500"><p>Aucun article trouvé</p></div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
