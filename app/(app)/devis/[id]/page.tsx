'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Send, Edit, Trash2, Share2, Mail, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { downloadQuotePdf } from '@/lib/pdf/export';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Quote, Client, QuoteItem, User } from '@/types';

type QuoteWithRelations = Quote & {
  client: Client;
  quote_items: QuoteItem[];
};

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-800' },
  accepted: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
  refused: { label: 'Refusé', color: 'bg-red-100 text-red-800' },
  expired: { label: 'Expiré', color: 'bg-gray-100 text-gray-800' },
};

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteWithRelations | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  const quoteId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : null;

  useEffect(() => {
    if (!quoteId) return;
    loadQuote(quoteId);
  }, [quoteId]);

  const loadQuote = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/connexion');
        return;
      }

      // Load profile - Requête optimisée (seulement les colonnes nécessaires)
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erreur chargement profil:', profileError);
      }

      if (profileData) {
        console.log('[Debug] Profil chargé:', {
          id: profileData.id,
          has_logo_url: !!profileData.logo_url,
          logo_url: profileData.logo_url,
          has_signature_url: !!profileData.signature_url,
        });
        setProfile(profileData);
      }

      // Load quote with relations - Requête optimisée
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(id, full_name, phone, email, address),
          quote_items(id, name, description, quantity, unit, unit_price, amount, order)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Sort items by order
        data.quote_items = data.quote_items.sort((a: any, b: any) => a.order - b.order);
        setQuote(data as QuoteWithRelations);
      }
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      alert('Devis introuvable');
      router.push('/devis');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return;

    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'sent' && quote.status === 'draft') {
        updateData.sent_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quote.id);

      if (error) throw error;

      await loadQuote(quote.id);
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!quote || !confirm('Supprimer ce devis définitivement ?')) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quote.id);

      if (error) throw error;

      router.push('/devis');
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!quote || !profile) return;

    try {
      const message = `Bonjour ${quote.client.full_name},\n\nVoici votre devis ${quote.quote_number} d'un montant de ${formatCurrency(Number(quote.total))}.\n\nDate: ${format(new Date(quote.date), 'dd/MM/yyyy')}\nValable jusqu'au: ${format(new Date(quote.valid_until), 'dd/MM/yyyy')}\n\nCordialement,\n${profile.business_name || profile.full_name}${profile.phone ? `\nTél: ${profile.phone}` : ''}`;
      
      // WhatsApp
      const phone = quote.client.phone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Mettre à jour le statut si c'est un brouillon
      if (quote.status === 'draft') {
        await handleStatusChange('sent');
      }
    } catch (error: any) {
      alert('Erreur lors de l\'envoi WhatsApp: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const handleShareEmail = () => {
    if (!quote || !profile) return;

    const subject = encodeURIComponent(`Devis ${quote.quote_number} - ${profile.business_name || profile.full_name}`);
    const body = encodeURIComponent(
      `Bonjour ${quote.client.full_name},\n\n` +
      `Voici votre devis ${quote.quote_number} d'un montant de ${formatCurrency(Number(quote.total))}.\n\n` +
      `Date: ${format(new Date(quote.date), 'dd/MM/yyyy')}\n` +
      `Valable jusqu'au: ${format(new Date(quote.valid_until), 'dd/MM/yyyy')}\n\n` +
      `Cordialement,\n${profile.business_name || profile.full_name}\n` +
      (profile.phone ? `Tél: ${profile.phone}\n` : '') +
      (profile.email ? `Email: ${profile.email}` : '')
    );
    
    const mailtoUrl = `mailto:${quote.client.email || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleDownloadPdf = async () => {
    if (!quote || !profile) return;
    try {
      await downloadQuotePdf({
        quote,
        profile,
        filename: `${quote.quote_number}.pdf`,
      });
    } catch (e: any) {
      alert(e?.message || 'Erreur lors de la génération du PDF');
    }
  };

  if (loading || !quote) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const status = STATUS_CONFIG[quote.status];
  const isPro = profile?.plan === 'pro';

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/devis">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{quote.quote_number}</h1>
              <p className="text-gray-600">
                Créé le {format(new Date(quote.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleShareWhatsApp} variant="default" disabled={!quote.client.phone} className="font-semibold">
                <MessageCircle className="w-5 h-5 mr-2" />
                Envoyer WhatsApp
              </Button>
              {quote.client.email && (
                <Button onClick={handleShareEmail} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Envoyer Email
                </Button>
              )}
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!profile} className="font-semibold border-2">
                <Download className="w-5 h-5 mr-2" />
                Export PDF
              </Button>
              {quote.status === 'draft' && (
                <Button variant="outline" disabled className="font-semibold border-2">
                  <Edit className="w-5 h-5 mr-2" />
                  Modifier
                </Button>
              )}
              <div className="flex-1"></div>
              <Select value={quote.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quote Content */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {profile?.business_name || profile?.full_name}
                </CardTitle>
                {profile?.address && <p className="text-sm text-gray-600">{profile.address}</p>}
                {profile?.phone && <p className="text-sm text-gray-600">Tél: {profile.phone}</p>}
                {profile?.email && <p className="text-sm text-gray-600">Email: {profile.email}</p>}
                {profile?.ninea && <p className="text-sm text-gray-600">NINEA: {profile.ninea}</p>}
              </div>
              {profile?.logo_url && (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="w-24 h-24 object-contain"
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Document Type & Service */}
            <div className="text-center border-b-2 border-primary pb-4">
              <h2 className="text-3xl font-bold text-primary mb-2 tracking-wider">
                {quote.document_type === 'facture' ? 'FACTURE' : 'DEVIS'}
              </h2>
              {quote.service_description && (
                <p className="text-lg text-gray-700 italic">{quote.service_description}</p>
              )}
            </div>

            {/* Client & Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2">
                  {quote.document_type === 'facture' ? 'FACTURÉ À:' : 'DEVIS POUR:'}
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{quote.client.full_name}</p>
                  <p className="text-sm text-gray-600">{quote.client.phone}</p>
                  {quote.client.email && <p className="text-sm text-gray-600">{quote.client.email}</p>}
                  {quote.client.address && <p className="text-sm text-gray-600">{quote.client.address}</p>}
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-sm text-gray-500 mb-2">INFORMATIONS:</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">N°:</span> {quote.quote_number}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Date:</span> {format(new Date(quote.date), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">
                      {quote.document_type === 'facture' ? 'Échéance:' : 'Valable jusqu\'au:'}
                    </span>{' '}
                    {format(new Date(quote.valid_until), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">Description</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide w-20">Qté</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide w-24">Unité</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide w-32">Prix Unit.</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide w-32">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.quote_items && quote.quote_items.length > 0 ? (
                    quote.quote_items.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900 text-base">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="text-center py-4 px-4 text-gray-900 font-medium">{item.quantity}</td>
                        <td className="text-center py-4 px-4 text-gray-700">{item.unit}</td>
                        <td className="text-right py-4 px-4 text-gray-900 font-medium">{formatCurrency(item.unit_price)}</td>
                        <td className="text-right py-4 px-4 font-bold text-gray-900 text-base">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Aucun article ajouté
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-300 pt-6 mt-6">
              <div className="flex justify-end">
                <div className="w-full md:w-96 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-700 font-medium">Sous-total:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(Number(quote.subtotal))}</span>
                    </div>
                  
                    {quote.discount_amount > 0 && (
                      <div className="flex justify-between text-base text-red-600">
                        <span className="font-medium">
                          Remise {quote.discount_type === 'percent' ? `(${quote.discount_value}%)` : ''}:
                        </span>
                        <span className="font-semibold">- {formatCurrency(Number(quote.discount_amount))}</span>
                      </div>
                    )}
                    
                    {quote.tax_amount > 0 && (
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700 font-medium">TVA ({quote.tax_rate}%):</span>
                        <span className="font-semibold text-gray-900">+ {formatCurrency(Number(quote.tax_amount))}</span>
                      </div>
                    )}
                  
                    <div className="flex justify-between text-2xl font-bold text-primary border-t-2 border-gray-300 pt-4 mt-4">
                      <span>TOTAL TTC:</span>
                      <span className="text-primary">{formatCurrency(Number(quote.total))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms & Notes */}
            {(quote.payment_terms || quote.notes) && (
              <div className="border-t pt-4 space-y-4">
                {quote.payment_terms && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Conditions de paiement:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.payment_terms}</p>
                  </div>
                )}
                {quote.notes && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Notes:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Watermark */}
            {!isPro && (
              <div className="text-center text-sm text-gray-400 italic border-t pt-4">
                Généré avec DevisRapide - www.devisrapide.com
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}

