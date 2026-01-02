import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET non configuré');
    return NextResponse.json(
      { error: 'Configuration webhook manquante' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Erreur vérification signature webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);

        // Si c'est un abonnement
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as Stripe.Subscription;

          // Mettre à jour le paiement
          await supabase
            .from('payments')
            .update({
              status: 'succeeded',
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : null,
              subscription_current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            } as any)
            .eq('stripe_session_id', session.id);

          // Mettre à jour l'utilisateur
          const userId = session.metadata?.user_id;
          if (userId) {
            const expiresAt = new Date((subscription as any).current_period_end * 1000);

            await supabase
              .from('users')
              .update({
                plan: 'pro',
                plan_expires_at: expiresAt.toISOString(),
                stripe_subscription_id: subscription.id,
              })
              .eq('id', userId);

            console.log(`✅ User ${userId} upgraded to PRO until ${expiresAt}`);
          }
        } else {
          // Paiement unique (facture)
          await supabase
            .from('payments')
            .update({
              status: 'succeeded',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_session_id', session.id);

          // Si c'est un upgrade PRO (paiement unique)
          if (session.metadata?.type === 'upgrade_pro') {
            const userId = session.metadata.user_id;
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await supabase
              .from('users')
              .update({
                plan: 'pro',
                plan_expires_at: expiresAt.toISOString(),
              })
              .eq('id', userId);
          }

          // Paiement de facture
          if (session.metadata?.type === 'invoice_payment' && session.metadata.quote_id) {
            // Marquer la facture comme payée si nécessaire
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id, subscription.status);

        // Mettre à jour le paiement
        await supabase
          .from('payments')
          .update({
            subscription_status: subscription.status,
            subscription_current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          } as any)
          .eq('stripe_subscription_id', subscription.id);

        // Mettre à jour l'utilisateur
        const userId = subscription.metadata?.user_id;
        if (userId) {
          const expiresAt = new Date((subscription as any).current_period_end * 1000);
          const plan = subscription.status === 'active' ? 'pro' : 'free';

          await supabase
            .from('users')
            .update({
              plan,
              plan_expires_at: subscription.status === 'active' ? expiresAt.toISOString() : null,
            })
            .eq('id', userId);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription deleted:', subscription.id);

        // Mettre à jour le paiement
        await supabase
          .from('payments')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Rétrograder l'utilisateur
        const userId = subscription.metadata?.user_id;
        if (userId) {
          await supabase
            .from('users')
            .update({
              plan: 'free',
              plan_expires_at: null,
            })
            .eq('id', userId);

          console.log(`❌ User ${userId} downgraded to FREE`);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('⚠️ Payment failed for invoice:', invoice.id);

        const subscription = (invoice as any).subscription as string;
        if (subscription) {
          await supabase
            .from('payments')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription);
        }

        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id);

        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id);

        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    );
  }
}

// GET pour tester que le webhook est accessible
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Stripe actif',
    timestamp: new Date().toISOString(),
  });
}
