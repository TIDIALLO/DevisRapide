import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRO_PRICE = 4900; // FCFA
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_dRm5kFc3O9hb3968ITfbq00tu';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur n'est pas déjà PRO
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan === 'pro') {
      return NextResponse.json(
        { error: 'Vous êtes déjà abonné au plan PRO' },
        { status: 400 }
      );
    }

    // Enregistrer la transaction en attente dans la base de données
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        quote_id: null,
        stripe_checkout_url: STRIPE_CHECKOUT_URL,
        amount: PRO_PRICE,
        currency: 'XOF',
        payment_type: 'stripe_card' as any,
        payment_provider: 'stripe' as any,
        status: 'pending',
        is_subscription: true as any,
        metadata: {
          type: 'upgrade_pro',
          user_email: user.email,
        },
      } as any)
      .select()
      .single();

    if (paymentError) {
      console.error('Erreur enregistrement paiement:', paymentError);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: STRIPE_CHECKOUT_URL,
      paymentId: payment?.id,
    });
  } catch (error: any) {
    console.error('Erreur création upgrade:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erreur lors de la création du paiement',
      },
      { status: 500 }
    );
  }
}
