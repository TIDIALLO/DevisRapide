'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PaymentModal } from '@/components/payment/payment-modal';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { Crown, Check, ArrowLeft } from 'lucide-react';
import {
  PRO_FEATURES,
  FREE_FEATURES,
  PRO_PRICE_MONTHLY,
  PLANS,
  formatPriceFCFA,
  getProPriceLabel,
  TRIAL_DURATION_DAYS,
} from '@/lib/subscription/config';
import { getPlanStatus } from '@/lib/subscription/plan-validator';
import type { UserPlanInfo } from '@/lib/subscription/plan-validator';

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClient();
  const { showAlert, AlertDialog } = useAlertDialog();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/connexion');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
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

  // Déterminer le statut réel du plan (essai, actif, expiré…)
  const planStatus = profile
    ? getPlanStatus({
        plan: profile.plan,
        planExpiresAt: profile.plan_expires_at,
        createdAt: profile.created_at,
      })
    : null;

  const hasProAccess = planStatus?.hasProAccess ?? false;

  if (hasProAccess && planStatus?.status === 'active') {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-8">
          <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8" />
                <div>
                  <CardTitle className="text-white text-2xl">Vous êtes déjà PRO !</CardTitle>
                  <CardDescription className="text-amber-100">
                    {planStatus.isTrial
                      ? `Essai gratuit — ${planStatus.daysRemaining} jour${planStatus.daysRemaining > 1 ? 's' : ''} restant${planStatus.daysRemaining > 1 ? 's' : ''}`
                      : 'Vous avez accès à toutes les fonctionnalités premium'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">
                  Retour au tableau de bord
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profil">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Passer au Plan PRO</h1>
            <p className="text-gray-600 mt-1">Débloquez toutes les fonctionnalités premium</p>
          </div>
        </div>

        {/* Avertissement si plan expiré */}
        {planStatus?.status === 'expired' && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 font-semibold">
                ⚠️ {planStatus.warningMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Avertissement si paiement en retard */}
        {planStatus?.status === 'past_due' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-orange-700 font-semibold">
                ⏳ {planStatus.warningMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pricing Card */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-white to-primary/5 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full"></div>
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-primary rounded-lg shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900">Plan PRO</CardTitle>
                </div>
                <CardDescription className="text-base font-medium text-gray-700">
                  {PLANS.pro.description}
                </CardDescription>
              </div>
              <span className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                ⭐ Populaire
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Price */}
            <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border-2 border-primary/20">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-black text-gray-900">4</span>
                <span className="text-4xl font-bold text-primary">.</span>
                <span className="text-6xl font-black text-gray-900">900</span>
                <span className="text-2xl font-bold text-gray-600 ml-2">FCFA</span>
              </div>
              <div className="text-base text-gray-600 mt-2 font-semibold">/mois</div>
              <p className="text-sm text-green-600 font-bold mt-3 flex items-center justify-center gap-2">
                <span className="text-lg">✅</span> Essai {TRIAL_DURATION_DAYS} jours gratuits
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-3">Fonctionnalités incluses :</h3>
              {PRO_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={async () => {
                try {
                  setLoading(true);
                  const response = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      isUpgrade: true,
                      amount: PRO_PRICE_MONTHLY,
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    if (data.code === 'STRIPE_CONFIG_MISSING') {
                      alert(data.error || 'Configuration Stripe manquante');
                      throw new Error(data.error);
                    }
                    throw new Error(data.error || 'Erreur lors de la création de la session');
                  }

                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    throw new Error('URL de checkout non reçue');
                  }
                } catch (error: any) {
                  console.error('Erreur:', error);
                  showAlert(error.message || 'Une erreur est survenue. Veuillez réessayer.', 'Erreur');
                  setLoading(false);
                }
              }}
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                  Chargement...
                </>
              ) : (
                <>
                  <Crown className="w-6 h-6 mr-2" />
                  S&apos;abonner au Plan PRO — {getProPriceLabel()}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Paiement sécurisé • Annulation à tout moment
              <br />
              Renouvellement automatique chaque mois
            </p>
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fonctionnalité</th>
                    <th className="text-center py-3 px-4">Gratuit</th>
                    <th className="text-center py-3 px-4 bg-primary/10">PRO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Devis par mois</td>
                    <td className="text-center py-3 px-4">{PLANS.free.maxQuotes}</td>
                    <td className="text-center py-3 px-4 bg-primary/10 font-semibold">Illimité</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Articles catalogue</td>
                    <td className="text-center py-3 px-4">{PLANS.free.maxCatalogItems}</td>
                    <td className="text-center py-3 px-4 bg-primary/10 font-semibold">Illimité</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Clients</td>
                    <td className="text-center py-3 px-4">{PLANS.free.maxClients}</td>
                    <td className="text-center py-3 px-4 bg-primary/10 font-semibold">Illimité</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Watermark sur PDF</td>
                    <td className="text-center py-3 px-4">Oui</td>
                    <td className="text-center py-3 px-4 bg-primary/10 font-semibold">Non</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Export multi-format</td>
                    <td className="text-center py-3 px-4">—</td>
                    <td className="text-center py-3 px-4 bg-primary/10 font-semibold">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Support</td>
                    <td className="text-center py-3 px-4">Email (48h)</td>
                    <td className="text-center py-3 px-4 bg-primary/10 font-semibold">WhatsApp prioritaire</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          amount={PRO_PRICE_MONTHLY}
          quoteNumber="UPGRADE-PRO"
          quoteId="upgrade-pro"
          onPaymentInitiated={() => {
            setPaymentModalOpen(false);
          }}
        />
        {AlertDialog}
      </div>
    </AppShell>
  );
}
