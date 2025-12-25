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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Search, Save, Send, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Client, CatalogItem } from '@/types';


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

export default function NewQuotePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
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
  
  // Dialogs
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [searchCatalog, setSearchCatalog] = useState('');
  const [newClientData, setNewClientData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/connexion');
        return;
      }

      setUser(authUser);

      // Load profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile?.default_payment_terms) {
        setPaymentTerms(profile.default_payment_terms);
      }

      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (clientsData) {
        setClients(clientsData);
      }

      // Load catalog
      const { data: catalogData } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('user_id', authUser.id)
        .order('name');

      if (catalogData) {
        setCatalogItems(catalogData);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientData.full_name || !newClientData.phone) {
      alert('⚠️ Le nom complet et le téléphone sont obligatoires.');
      return;
    }

    console.log('🚀 Début création client...');
    
    try {
      // 1. Vérifier et rafraîchir la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.user) {
        console.error('Erreur session:', sessionError);
        alert('❌ Votre session a expiré. Veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }

      const currentUser = session.user;

      // 2. Vérifier que l'utilisateur correspond
      if (!user || currentUser.id !== user.id) {
        alert('❌ Erreur de session. Veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }

      const clientData = {
        user_id: currentUser.id, // Doit correspondre à auth.uid() pour que RLS accepte
        full_name: newClientData.full_name.trim(),
        phone: newClientData.phone.trim(),
        email: newClientData.email?.trim() || null,
        address: newClientData.address?.trim() || null,
      };

      console.log('Création client avec user_id:', currentUser.id);
      console.log('Données client:', clientData);
      
      // Vérifier une dernière fois la session avant l'insertion
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      if (!finalSession || finalSession.user.id !== currentUser.id) {
        console.error('❌ Session invalide au moment de l\'insertion');
        alert('❌ Votre session a expiré. Veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      
      console.log('✅ Session confirmée avant insertion - User ID:', finalSession.user.id);
      console.log('📤 Envoi de la requête INSERT avec:', {
        user_id: clientData.user_id,
        full_name: clientData.full_name,
        phone: clientData.phone,
      });

      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      console.log('📥 Réponse reçue:', { data: data ? 'OK' : 'NULL', error: error ? 'ERROR' : 'NONE' });

      if (error) {
        // Extraire les informations AVANT de logger pour éviter la perte d'information
        const errorInfo: any = {
          // Propriétés standard Supabase
          message: (error as any)?.message || null,
          code: (error as any)?.code || null,
          details: (error as any)?.details || null,
          hint: (error as any)?.hint || null,
          status: (error as any)?.status || null,
          statusCode: (error as any)?.statusCode || null,
          // Propriétés supplémentaires
          name: (error as any)?.name || null,
          // Toutes les clés disponibles
          keys: Object.keys(error),
          allPropertyNames: Object.getOwnPropertyNames(error),
          // String representation
          stringValue: String(error),
          // Type
          type: typeof error,
          // Constructor
          constructor: error?.constructor?.name || null,
        };
        
        // Essayer de sérialiser
        try {
          errorInfo.serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch (e) {
          errorInfo.serializationError = String(e);
        }
        
        // Logger toutes les informations
        console.error('❌ Erreur création client - Objet:', error);
        console.error('📋 Informations extraites:', errorInfo);
        console.error('🔍 Type:', typeof error);
        console.error('🔑 Clés directes:', Object.keys(error));
        console.error('🔑 Toutes les propriétés:', Object.getOwnPropertyNames(error));
        
        // Logger l'erreur de manière différente
        console.error('📦 Erreur (direct):', error);
        console.error('📦 Erreur (JSON):', JSON.stringify(error, null, 2));
        console.error('📦 Erreur (toString):', error.toString?.());
        
        // Utiliser les informations extraites pour les messages
        const clientErrorCode = errorInfo.code;
        const clientErrorMessage = errorInfo.message || errorInfo.stringValue || '';
        
        // Messages d'erreur selon le code
        if (clientErrorCode === '42501' || clientErrorMessage?.includes('row-level security') || clientErrorMessage?.includes('RLS')) {
          throw new Error('🔒 Erreur de sécurité : Votre session n\'est pas valide. Veuillez vous déconnecter et vous reconnecter.');
        }
        if (clientErrorCode === '23505' || clientErrorMessage?.includes('duplicate')) {
          throw new Error('📧 Ce client existe déjà (même nom ou téléphone).');
        }
        if (clientErrorCode === 'PGRST301' || clientErrorMessage?.includes('permission denied')) {
          throw new Error('🔒 Erreur de permission : Votre session n\'est pas correctement transmise. Veuillez vous reconnecter.');
        }
        if (clientErrorCode === 'PGRST116' || clientErrorMessage?.includes('JSON object requested')) {
          throw new Error('❌ Erreur de format : Les données envoyées sont invalides.');
        }
        
        // Si l'erreur est vraiment vide, utiliser un message générique avec les infos disponibles
        const finalMessage = clientErrorMessage || errorInfo.stringValue || 'Une erreur est survenue lors de la création du client.';
        throw new Error(`❌ ${finalMessage}${clientErrorCode ? ` (Code: ${clientErrorCode})` : ''}`);
      }

      if (!data) {
        throw new Error('❌ Le client n\'a pas été créé. Aucune donnée retournée.');
      }

      console.log('✅ Client créé avec succès:', data);
      setClients([data, ...clients]);
      setSelectedClientId(data.id);
      setShowClientDialog(false);
      setNewClientData({ full_name: '', phone: '', email: '', address: '' });
    } catch (error: any) {
      // Capture complète de l'erreur avec toutes les informations possibles
      console.error('❌ Erreur complète dans handleCreateClient:', error);
      console.error('📋 Type:', typeof error);
      console.error('🔑 Clés:', error ? Object.keys(error) : 'error is null/undefined');
      console.error('📦 Stack:', error?.stack);
      console.error('📝 String:', String(error));
      console.error('🔢 Code:', error?.code);
      console.error('💬 Message:', error?.message);
      
      // Extraire le message d'erreur de manière robuste
      let errorMessage = 'Une erreur est survenue lors de la création du client.';
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString && typeof error.toString === 'function') {
        const errorStr = error.toString();
        if (errorStr && errorStr !== '[object Object]') {
          errorMessage = errorStr;
        }
      }
      
      // Si le message est toujours générique, essayer de sérialiser
      if (errorMessage === 'Une erreur est survenue lors de la création du client.' && error) {
        try {
          const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
          if (errorStr && errorStr !== '{}' && errorStr !== 'null') {
            console.error('📄 Erreur sérialisée:', errorStr);
            // Si on peut extraire un message de la sérialisation
            const parsed = JSON.parse(errorStr);
            if (parsed.message) {
              errorMessage = parsed.message;
            } else if (parsed.code) {
              errorMessage = `Erreur ${parsed.code}`;
            }
          }
        } catch (e) {
          console.error('❌ Impossible de sérialiser l\'erreur:', e);
        }
      }
      
      // Afficher un message d'erreur clair
      alert(`❌ ${errorMessage}\n\nVérifiez la console pour plus de détails.`);
    }
  };

  const handleAddCatalogItem = (catalogItem: CatalogItem) => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      catalog_item_id: catalogItem.id,
      name: catalogItem.name,
      description: catalogItem.description || '',
      quantity: 1,
      unit: catalogItem.unit,
      unit_price: catalogItem.unit_price,
      amount: catalogItem.unit_price,
    };
    setItems([...items, newItem]);
    setShowItemDialog(false);
    setSearchCatalog('');
  };

  const handleAddCustomItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'pièce',
      unit_price: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Recalculer le montant si quantité ou prix changent
      if (field === 'quantity' || field === 'unit_price') {
        updated.amount = updated.quantity * updated.unit_price;
      }
      
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discountType === 'none' ? 0 :
    discountType === 'percent' ? (subtotal * parseFloat(discountValue || '0')) / 100 :
    parseFloat(discountValue || '0');
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * parseFloat(taxRate || '0')) / 100;
  const total = afterDiscount + taxAmount;

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!user || !selectedClientId || items.length === 0) {
      alert('Veuillez sélectionner un client et ajouter au moins un article');
      return;
    }

    setSaving(true);
    try {
      // Vérifier la session avant de créer le devis
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.user || session.user.id !== user.id) {
        console.error('❌ Erreur session:', sessionError);
        alert('❌ Votre session a expiré. Veuillez vous reconnecter.');
        router.push('/connexion');
        setSaving(false);
        return;
      }

      // Generate quote number - Essayer d'abord la fonction RPC, sinon générer manuellement
      let quoteNumber: string;
      
      try {
        const { data: quoteNumberData, error: rpcError } = await supabase
          .rpc('generate_quote_number', { p_user_id: user.id });
        
        if (rpcError) {
          // L'erreur peut être vide, donc on vérifie aussi si data est null
          console.warn('⚠️ Erreur ou absence de réponse de generate_quote_number, génération manuelle');
          console.warn('Détails RPC:', {
            hasError: !!rpcError,
            errorType: typeof rpcError,
            errorKeys: rpcError ? Object.keys(rpcError) : [],
            data: quoteNumberData,
          });
          
          // Générer le numéro manuellement
          quoteNumber = await generateQuoteNumberManually(user.id);
        } else if (quoteNumberData) {
          quoteNumber = quoteNumberData;
        } else {
          // Pas d'erreur mais pas de données non plus, générer manuellement
          console.warn('⚠️ generate_quote_number n\'a retourné aucune donnée, génération manuelle');
          quoteNumber = await generateQuoteNumberManually(user.id);
        }
      } catch (rpcException: any) {
        // Exception lors de l'appel RPC, générer manuellement
        console.warn('⚠️ Exception lors de l\'appel generate_quote_number, génération manuelle:', rpcException);
        quoteNumber = await generateQuoteNumberManually(user.id);
      }
      
      // Créer le devis avec le numéro généré
      await createQuote(quoteNumber, status);
    } catch (error: any) {
      console.error('❌ Erreur création devis:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création du devis.';
      
      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        errorMessage = '🔒 Erreur de sécurité : Votre session n\'est pas valide. Veuillez vous reconnecter.';
      } else if (error?.code === 'PGRST301' || error?.message?.includes('permission denied')) {
        errorMessage = '🔒 Erreur de permission : Vous n\'avez pas les droits nécessaires.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
      setSaving(false);
    }
  };

  // Fonction helper pour générer le numéro de devis manuellement
  const generateQuoteNumberManually = async (userId: string): Promise<string> => {
    try {
      // Compter les quotes existantes pour générer le numéro
      const { count, error: countError } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.warn('⚠️ Erreur lors du comptage des quotes, utilisation d\'un numéro basé sur le timestamp');
        // Utiliser un numéro basé sur le timestamp en dernier recours
        return `DEV-${Date.now().toString().slice(-6)}`;
      }
      
      const nextNumber = (count || 0) + 1;
      return `DEV-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.warn('⚠️ Exception lors de la génération manuelle, utilisation d\'un numéro basé sur le timestamp');
      return `DEV-${Date.now().toString().slice(-6)}`;
    }
  };

  const createQuote = async (quoteNumber: string, status: 'draft' | 'sent') => {
    // 1. Utiliser getUser() qui force un refresh de la session depuis le serveur
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !currentUser) {
      console.error('❌ Erreur utilisateur:', userError);
      console.error('User:', currentUser);
      throw new Error('🔒 Votre session a expiré. Veuillez vous reconnecter.');
    }

    // 2. Vérifier la session également pour s'assurer qu'elle est valide
    const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession();
    
    if (finalSessionError || !finalSession) {
      console.error('❌ Erreur session:', finalSessionError);
      console.error('Session:', finalSession);
      throw new Error('🔒 Problème de session détecté. Veuillez vous reconnecter.');
    }

    // 3. Vérifier que les IDs correspondent
    const currentUserId = currentUser.id;
    
    if (currentUserId !== user!.id || currentUserId !== finalSession.user.id) {
      console.error('❌ User ID mismatch:', { 
        getUser: currentUserId, 
        userState: user!.id,
        session: finalSession.user.id 
      });
      throw new Error('🔒 Erreur de session : Les identifiants ne correspondent pas.');
    }

    console.log('✅ Session confirmée avant création quote - User ID:', currentUserId);
    console.log('📤 Envoi de la requête INSERT avec:', {
      user_id: currentUserId,
      client_id: selectedClientId,
      quote_number: quoteNumber,
      status: status,
    });

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        user_id: currentUserId, // Utiliser l'ID de la session vérifiée
        client_id: selectedClientId,
        quote_number: quoteNumber,
        status: status,
        date: quoteDate,
        valid_until: validUntil,
        subtotal: subtotal,
        discount_type: discountType === 'none' ? null : discountType,
        discount_value: discountType === 'none' ? null : parseFloat(discountValue),
        discount_amount: discountAmount,
        tax_rate: parseFloat(taxRate),
        tax_amount: taxAmount,
        total: total,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    console.log('📥 Réponse création quote:', { 
      data: quote ? 'OK' : 'NULL', 
      error: quoteError ? 'ERROR' : 'NONE' 
    });

    if (quoteError) {
      // Extraire toutes les informations de l'erreur AVANT de logger
      const quoteErrorInfo: any = {
        message: (quoteError as any)?.message || null,
        code: (quoteError as any)?.code || null,
        details: (quoteError as any)?.details || null,
        hint: (quoteError as any)?.hint || null,
        status: (quoteError as any)?.status || null,
        statusCode: (quoteError as any)?.statusCode || null,
        name: (quoteError as any)?.name || null,
        keys: Object.keys(quoteError),
        allPropertyNames: Object.getOwnPropertyNames(quoteError),
        stringValue: String(quoteError),
        type: typeof quoteError,
        constructor: quoteError?.constructor?.name || null,
      };
      
      try {
        quoteErrorInfo.serialized = JSON.stringify(quoteError, Object.getOwnPropertyNames(quoteError));
      } catch (e) {
        quoteErrorInfo.serializationError = String(e);
      }
      
      console.error('❌ Erreur création quote - Objet:', quoteError);
      console.error('📋 Informations extraites:', quoteErrorInfo);
      console.error('🔍 Type:', typeof quoteError);
      console.error('🔑 Clés directes:', Object.keys(quoteError));
      console.error('🔑 Toutes les propriétés:', Object.getOwnPropertyNames(quoteError));
      console.error('📦 Erreur (direct):', quoteError);
      console.error('📦 Erreur (JSON):', JSON.stringify(quoteError, null, 2));
      console.error('📦 Erreur (toString):', quoteError.toString?.());
      
      const quoteErrorCode = quoteErrorInfo.code;
      const quoteErrorMessage = quoteErrorInfo.message || quoteErrorInfo.stringValue || '';
      
      // Messages d'erreur spécifiques
      if (quoteErrorCode === '42501' || quoteErrorMessage?.includes('row-level security') || quoteErrorMessage?.includes('RLS')) {
        // Erreur RLS - Les politiques ne sont pas configurées
        console.error('🚨 ERREUR RLS (42501) - Les politiques RLS ne sont pas configurées');
        console.error('📋 User ID:', currentUserId);
        console.error('📋 Session valide:', !!finalSession);
        
        // Afficher un message clair avec instructions
        const errorMsg = `🔒 Erreur de sécurité RLS

Les politiques de sécurité (RLS) ne sont pas configurées dans Supabase.

SOLUTION :
1. Aller dans Supabase Dashboard → SQL Editor
2. Exécuter : lib/supabase/FIX_QUOTES_RLS_DEFINITIVE.sql
3. Se déconnecter et se reconnecter
4. Réessayer

Voir EXECUTER_SCRIPT_SQL.md pour les instructions détaillées.`;
        
        alert(errorMsg);
        throw new Error('🔒 Erreur RLS : Les politiques de sécurité ne sont pas configurées. Veuillez exécuter le script SQL FIX_QUOTES_RLS_DEFINITIVE.sql dans Supabase Dashboard.');
      }
      if (quoteErrorCode === '23505' || quoteErrorMessage?.includes('duplicate')) {
        throw new Error('📧 Un devis avec ce numéro existe déjà.');
      }
      if (quoteErrorCode === 'PGRST301' || quoteErrorMessage?.includes('permission denied')) {
        throw new Error('🔒 Erreur de permission : Vous n\'avez pas les droits nécessaires.');
      }
      if (quoteErrorCode === '23503' || quoteErrorMessage?.includes('foreign key')) {
        throw new Error('❌ Erreur : Le client sélectionné n\'existe pas ou n\'est plus accessible.');
      }
      
      // Erreur générique avec toutes les informations disponibles
      const finalMessage = quoteErrorMessage || 'Une erreur est survenue lors de la création du devis.';
      throw new Error(`❌ ${finalMessage}${quoteErrorCode ? ` (Code: ${quoteErrorCode})` : ''}`);
    }

    if (!quote) {
      throw new Error('Le devis n\'a pas été créé. Aucune donnée retournée.');
    }

    // Create quote items
    const quoteItems = items.map((item, index) => ({
      quote_id: quote.id,
      name: item.name,
      description: item.description || null,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      amount: item.amount,
      order: index,
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems);

    if (itemsError) {
      console.error('❌ Erreur création quote_items:', itemsError);
      throw itemsError;
    }

    // Redirect to quote detail
    router.push(`/devis/${quote.id}`);
  };

  const filteredCatalogItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchCatalog.toLowerCase())
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
      <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-6">
        <div>
          <h1 className="text-3xl font-bold">Nouveau devis</h1>
          <p className="text-gray-600 mt-1">Créez un devis professionnel en quelques minutes</p>
        </div>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowClientDialog(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date du devis</Label>
                <Input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Valide jusqu'au</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>2. Articles / Services</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowItemDialog(true)}>
                  <Search className="w-4 h-4 mr-2" />
                  Catalogue
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddCustomItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Article custom
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Nom de l'article/service"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optionnel)"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        rows={2}
                      />
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                        <Input
                          placeholder="Unité"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Prix unit."
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1"
                        />
                        <div className="flex items-center justify-end font-semibold">
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
                <p className="text-sm">Cliquez sur "Catalogue" ou "Article custom" pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>3. Calculs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span>Sous-total:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            <div className="space-y-2">
              <Label>Remise (optionnel)</Label>
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="fixed">FCFA</SelectItem>
                  </SelectContent>
                </Select>
                {discountType !== 'none' && (
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="Montant"
                    min="0"
                  />
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Remise appliquée:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>TVA (optionnel)</Label>
              <div className="flex gap-2">
                <Select value={taxRate} onValueChange={setTaxRate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (pas de TVA)</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {taxAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>TVA ({taxRate}%):</span>
                  <span>+ {formatCurrency(taxAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-2xl font-bold text-primary">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>4. Informations complémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Conditions de paiement</Label>
              <Textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Ex: Paiement à 30 jours. Acompte de 30% requis."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes additionnelles</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes ou remarques..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-20 lg:bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder brouillon
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSave('sent')}
            disabled={saving}
          >
            <Send className="w-4 h-4 mr-2" />
            Créer et envoyer
          </Button>
        </div>
      </div>

      {/* Client Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
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
                onChange={(e) => setNewClientData({ ...newClientData, full_name: e.target.value })}
                placeholder="Ex: Fatou Seck"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={newClientData.address}
                onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                placeholder="Dakar, Sénégal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={!newClientData.full_name || !newClientData.phone}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                onChange={(e) => setSearchCatalog(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              {filteredCatalogItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddCatalogItem(item)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                  <div className="text-sm text-primary font-semibold mt-1">
                    {formatCurrency(item.unit_price)}/{item.unit}
                  </div>
                </button>
              ))}
              {filteredCatalogItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun article trouvé</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

