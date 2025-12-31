'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Crown, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    handleUpgrade();
  }, []);

  const handleUpgrade = async () => {
    try {
      const supabase = createClient();
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        // Si pas de session_id, vérifier le dernier paiement en attente
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .eq('metadata->>type', 'upgrade_pro')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (payment && payment.status === 'succeeded') {
            await upgradeUser(user.id);
            setUpgraded(true);
          }
        }
        setLoading(false);
        return;
      }

      // Trouver le paiement par session_id Stripe
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .eq('user_id', user.id)
        .eq('metadata->>type', 'upgrade_pro')
        .single();

      if (payment) {
        // Le webhook Stripe devrait avoir mis à jour le statut
        // Si le statut est succeeded, mettre à jour l'utilisateur
        if (payment.status === 'succeeded') {
          await upgradeUser(user.id);
          setUpgraded(true);
        } else {
          // Vérifier à nouveau après un délai (le webhook peut prendre du temps)
          setTimeout(async () => {
            const { data: updatedPayment } = await supabase
              .from('payments')
              .select('*')
              .eq('id', payment.id)
              .single();

            if (updatedPayment?.status === 'succeeded') {
              await upgradeUser(user.id);
              setUpgraded(true);
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erreur upgrade:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeUser = async (userId: string) => {
    const supabase = createClient();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mois

    await supabase
      .from('users')
      .update({
        plan: 'pro',
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);
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
              {upgraded ? 'Upgrade réussi !' : 'Paiement réussi !'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Crown className="h-16 w-16 text-primary" />
              </div>
              <p className="text-gray-700 mb-2 text-lg">
                {upgraded
                  ? 'Félicitations ! Vous êtes maintenant abonné au Plan PRO.'
                  : 'Votre paiement a été traité avec succès. Votre compte sera mis à jour dans quelques instants.'}
              </p>
              {upgraded && (
                <p className="text-sm text-gray-600 mt-2">
                  Vous avez maintenant accès à toutes les fonctionnalités premium !
                </p>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Montant payé</p>
              <p className="text-2xl font-bold text-green-700">
                5.000 FCFA
              </p>
              <p className="text-xs text-gray-500 mt-1">Abonnement mensuel</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  Accéder au tableau de bord
                </Button>
              </Link>
              <Link href="/profil" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voir mon profil
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
