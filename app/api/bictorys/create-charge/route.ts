import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCharge, convertToCentimes } from '@/lib/bictorys/client';
import type { PaymentType } from '@/lib/bictorys/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, paymentType, amount: customAmount, phone } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: 'quoteId est requis' },
        { status: 400 }
      );
    }

    // Charger la facture/devis
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*, client:clients(*)')
      .eq('id', quoteId)
      .eq('user_id', user.id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Facture introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que c'est une facture (pas un devis)
    if (quote.document_type !== 'facture') {
      return NextResponse.json(
        { error: 'Le paiement en ligne est uniquement disponible pour les factures' },
        { status: 400 }
      );
    }

    // Utiliser le montant personnalisé si fourni, sinon le montant de la facture
    const finalAmount = customAmount ? Number(customAmount) : Number(quote.total);
    const amountInCentimes = convertToCentimes(finalAmount);

    // Construire les URLs de redirection
    const baseUrl = request.nextUrl.origin;
    const successUrl = `${baseUrl}/paiement/succes`;
    const errorUrl = `${baseUrl}/paiement/erreur`;

    // Créer la charge Bictorys
    const chargeRequest: any = {
      amount: amountInCentimes,
      currency: 'XOF',
      country: 'SN',
      successRedirectUrl: successUrl,
      errorRedirectUrl: errorUrl,
      payment_type: paymentType as PaymentType | undefined, // Optionnel pour checkout
      metadata: {
        quote_id: quote.id,
        quote_number: quote.quote_number,
        user_id: user.id,
        client_name: quote.client?.full_name || '',
      },
    };

    // Ajouter le téléphone si fourni (pour Orange Money et Wave)
    if (phone && (paymentType === 'orange_money' || paymentType === 'wave')) {
      chargeRequest.operator = paymentType === 'orange_money' ? 'orange_money' : 'wave';
      chargeRequest.phone = phone;
    }

    const chargeResponse = await createCharge(chargeRequest);

    // Enregistrer la transaction dans la base de données
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        quote_id: quote.id,
        bictorys_charge_id: chargeResponse.id,
        amount: Number(quote.total),
        currency: 'XOF',
        payment_type: (paymentType as PaymentType) || 'card', // Par défaut card si non spécifié
        status: 'pending',
        success_redirect_url: successUrl,
        error_redirect_url: errorUrl,
        metadata: {
          quote_number: quote.quote_number,
          client_name: quote.client?.full_name || '',
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Erreur enregistrement paiement:', paymentError);
      // On continue quand même car la charge Bictorys est créée
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResponse.id,
      checkoutUrl: chargeResponse.checkout_url,
      paymentId: payment?.id,
    });
  } catch (error: any) {
    console.error('Erreur création charge Bictorys:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
