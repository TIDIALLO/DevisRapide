'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, FileText, Eye, Copy, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import type { Quote, Client } from '@/types';

type QuoteWithClient = Quote & { client: Client };

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  accepted: { label: 'Accepté', color: 'bg-green-100 text-green-800', icon: '🟢' },
  refused: { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: '🔴' },
  expired: { label: 'Expiré', color: 'bg-gray-100 text-gray-800', icon: '⚫' },
};

export default function DevisPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showAlert, AlertDialog } = useAlertDialog();
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/connexion');
        return;
      }

      // Requête optimisée - seulement les colonnes nécessaires
      const { data } = await supabase
        .from('quotes')
        .select('id, quote_number, status, total, created_at, valid_until, document_type, client:clients(id, full_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limiter à 100 devis pour améliorer les performances

      if (data) {
        setQuotes(data as QuoteWithClient[]);
      }
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (quote: Quote) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Dupliquer le devis
      const { data: newQuote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          client_id: quote.client_id,
          quote_number: `${quote.quote_number}-COPIE`,
          status: 'draft',
          date: new Date().toISOString().split('T')[0],
          valid_until: quote.valid_until,
          subtotal: quote.subtotal,
          discount_type: quote.discount_type,
          discount_value: quote.discount_value,
          discount_amount: quote.discount_amount,
          tax_rate: quote.tax_rate,
          tax_amount: quote.tax_amount,
          total: quote.total,
          payment_terms: quote.payment_terms,
          notes: quote.notes,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Dupliquer les items
      const { data: items } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id);

      if (items && items.length > 0) {
        const newItems = items.map((item) => ({
          quote_id: newQuote.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.amount,
          order: item.order,
        }));

        await supabase.from('quote_items').insert(newItems);
      }

      await loadQuotes();
      router.push(`/devis/${newQuote.id}`);
    } catch (error: any) {
      showAlert('Erreur: ' + error.message, 'Erreur');
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold">Mes devis</h1>
            <p className="text-gray-600 mt-1">{quotes.length} devis au total</p>
          </div>
          <Link href="/devis/nouveau">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher un devis ou client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quotes List */}
        {filteredQuotes.length > 0 ? (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => {
              const status = STATUS_CONFIG[quote.status];
              return (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{quote.quote_number}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {quote.client?.full_name}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>
                              Créé le {format(new Date(quote.created_at), 'dd MMM yyyy', { locale: fr })}
                            </span>
                            <span>•</span>
                            <span>
                              Valide jusqu'au {format(new Date(quote.valid_until), 'dd MMM yyyy', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(Number(quote.total))}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/devis/${quote.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(quote)}
                            title="Dupliquer"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Aucun devis trouvé'
                  : 'Aucun devis'}
              </p>
              <p className="mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Essayez une autre recherche'
                  : 'Créez votre premier devis pour commencer'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/devis/nouveau">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un devis
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
        {AlertDialog}
      </div>
    </AppShell>
  );
}

