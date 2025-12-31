'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      const supabase = createClient();
      const chargeId = searchParams.get('charge_id') || searchParams.get('id');

      if (!chargeId) {
        setLoading(false);
        return;
      }

      // Charger le paiement
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*, quote:quotes(*)')
        .eq('bictorys_charge_id', chargeId)
        .single();

      if (paymentData) {
        setPayment(paymentData);
        setQuote(paymentData.quote);
      }
    } catch (error) {
      console.error('Erreur chargement paiement:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-500 p-4">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">
              Paiement réussi !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Votre paiement a été traité avec succès.
              </p>
              {payment && (
                <p className="text-2xl font-bold text-green-700">
                  {new Intl.NumberFormat('fr-FR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                    .format(Number(payment.amount))
                    .replace(/\s/g, '.')}{' '}
                  FCFA
                </p>
              )}
            </div>

            {quote && (
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Facture</p>
                <p className="font-semibold">{quote.quote_number}</p>
                {payment?.metadata?.client_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Client: {payment.metadata.client_name}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {quote && (
                <Link href={`/devis/${quote.id}`} className="flex-1">
                  <Button className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voir la facture
                  </Button>
                </Link>
              )}
              <Link href="/devis" className="flex-1">
                <Button variant="outline" className="w-full">
                  Retour aux devis
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Un email de confirmation vous a été envoyé.</p>
              <p className="mt-1">Merci pour votre confiance !</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
