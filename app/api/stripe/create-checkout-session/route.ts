import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe/client';

const PRO_PRICE = 5000; // FCFA

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuration Stripe manquante. Vérifiez STRIPE_SECRET_KEY dans .env.local' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, amount: customAmount, isUpgrade } = body;

    // Déterminer le montant et le type de paiement
    let finalAmount: number;
    let metadata: Record<string, string> = {};
    let successUrl: string;
    let cancelUrl: string;
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (isUpgrade) {
      // ABONNEMENT PRO RÉCURRENT avec Stripe
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.plan === 'pro') {
        return NextResponse.json(
          { error: 'Vous êtes déjà abonné au plan PRO' },
          { status: 400 }
        );
      }

      // Récupérer ou créer un client Stripe
      let customerId = profile?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email!,
          name: profile?.full_name || user.email!,
          metadata: {
            user_id: user.id,
            business_name: profile?.business_name || '',
          },
        });

        customerId = customer.id;

        // Sauvegarder l'ID client
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      }

      metadata = {
        user_id: user.id,
        type: 'upgrade_pro',
      };

      successUrl = `${request.nextUrl.origin}/upgrade/succes?session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${request.nextUrl.origin}/upgrade?canceled=true`;

      // Utiliser le mode SUBSCRIPTION avec le Price ID
      // On retournera une session différente en bas
      const subscriptionSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: STRIPE_PRICE_ID, // Utiliser le Price ID créé dans Stripe
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        subscription_data: {
          metadata: {
            user_id: user.id,
          },
        },
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
      });

      // Enregistrer la transaction dans la base de données
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          quote_id: null, // Pas de facture pour les upgrades
          stripe_session_id: subscriptionSession.id,
          stripe_customer_id: customerId,
          amount: PRO_PRICE,
          currency: 'XOF',
          payment_type: 'stripe_subscription',
          payment_provider: 'stripe',
          status: 'pending',
          is_subscription: true,
          success_redirect_url: successUrl,
          error_redirect_url: cancelUrl,
          metadata: {
            type: 'upgrade_pro',
            user_email: user.email,
            amount: PRO_PRICE.toString(),
          },
        })
        .select()
        .single();

      if (paymentError) {
        console.error('[Stripe] Erreur enregistrement paiement:', paymentError);
        console.error('[Stripe] Détails:', {
          code: paymentError.code,
          message: paymentError.message,
          details: paymentError.details,
          hint: paymentError.hint,
        });
        // On continue quand même car la session Stripe est créée
      } else {
        console.log('[Stripe] Paiement enregistré avec succès:', payment.id);
      }

      return NextResponse.json({
        success: true,
        sessionId: subscriptionSession.id,
        url: subscriptionSession.url,
        paymentId: payment?.id,
      });
    } else {
      // Paiement pour factures désactivé - uniquement les abonnements PRO sont payables
      return NextResponse.json(
        { error: 'Le paiement en ligne des factures n\'est pas disponible. Utilisez le plan PRO pour un accès illimité.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erreur lors de la création de la session de paiement',
      },
      { status: 500 }
    );
  }
}
