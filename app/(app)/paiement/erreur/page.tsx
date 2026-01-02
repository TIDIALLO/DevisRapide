'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function PaymentErrorContent() {
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

  const handleRetry = () => {
    if (quote) {
      router.push(`/devis/${quote.id}`);
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
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-500 p-4">
                <XCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700">
              Paiement échoué
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Votre paiement n'a pas pu être traité.
              </p>
              <p className="text-sm text-gray-600">
              {payment?.status === 'failed' && (
                <span className="block mt-2">
                  Le paiement a été refusé. Veuillez vérifier vos informations ou essayer un autre mode de paiement.
                </span>
              )}
              {payment?.status === 'canceled' && (
                <span className="block mt-2">
                  Le paiement a été annulé. Vous pouvez réessayer à tout moment.
                </span>
              )}
              </p>
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
                <Button onClick={handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer le paiement
                </Button>
              )}
              <Link href="/devis" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux devis
                </Button>
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                Besoin d'aide ?
              </p>
              <p className="text-sm text-blue-700">
                Si le problème persiste, contactez le support ou essayez un autre mode de paiement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}
