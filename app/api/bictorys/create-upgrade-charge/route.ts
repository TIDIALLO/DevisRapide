/* BICTORYS - COMMENTÉ - Utilisation de Stripe maintenant
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCharge, convertToCentimes } from '@/lib/bictorys/client';
import type { PaymentType } from '@/lib/bictorys/types';

const PRO_PRICE = 5000; // FCFA

export async function POST(request: NextRequest) {
  try {
    // Diagnostic : Vérifier que les variables d'environnement sont chargées
    const hasApiKey = !!process.env.BICTORYS_API_KEY_PUBLIC;
    const environment = process.env.BICTORYS_ENVIRONMENT;
    
    console.log('[Upgrade] Variables d\'environnement:', {
      hasApiKey,
      environment,
      apiKeyPrefix: process.env.BICTORYS_API_KEY_PUBLIC?.substring(0, 30) + '...',
    });

    if (!hasApiKey) {
      return NextResponse.json(
        { 
          error: 'Configuration API manquante. La variable BICTORYS_API_KEY_PUBLIC n\'est pas définie. Vérifiez votre fichier .env.local et redémarrez le serveur.',
          details: 'Redémarrez le serveur avec: npm run dev'
        },
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
    const { paymentType, amount: customAmount, phone } = body;

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

    // Utiliser le montant personnalisé si fourni, sinon le prix PRO par défaut
    const finalAmount = customAmount ? Number(customAmount) : PRO_PRICE;
    const amountInCentimes = convertToCentimes(finalAmount);

    // Construire les URLs de redirection
    const baseUrl = request.nextUrl.origin;
    const successUrl = `${baseUrl}/upgrade/succes`;
    const errorUrl = `${baseUrl}/upgrade/erreur`;

    // Créer la charge Bictorys
    console.log('[Upgrade] Création charge Bictorys:', {
      amount: amountInCentimes,
      currency: 'XOF',
      country: 'SN',
      payment_type: paymentType,
      successUrl,
      errorUrl,
    });

    let chargeResponse;
    try {
      const chargeRequest: any = {
        amount: amountInCentimes,
        currency: 'XOF',
        country: 'SN',
        successRedirectUrl: successUrl,
        errorRedirectUrl: errorUrl,
        payment_type: paymentType as PaymentType | undefined,
        metadata: {
          user_id: user.id,
          type: 'upgrade_pro',
          amount: finalAmount,
        },
      };

      // Ajouter le téléphone si fourni (pour Orange Money et Wave)
      if (phone && (paymentType === 'orange_money' || paymentType === 'wave')) {
        chargeRequest.operator = paymentType === 'orange_money' ? 'orange_money' : 'wave';
        chargeRequest.phone = phone;
      }

      chargeResponse = await createCharge(chargeRequest);
      console.log('[Upgrade] Charge créée avec succès:', chargeResponse.id);
    } catch (chargeError: any) {
      console.error('[Upgrade] Erreur création charge Bictorys:', chargeError);
      throw chargeError;
    }

    // Enregistrer la transaction dans la base de données
    let payment = null;
    try {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          quote_id: null, // Pas de facture pour les upgrades
          bictorys_charge_id: chargeResponse.id,
          amount: PRO_PRICE,
          currency: 'XOF',
          payment_type: (paymentType as PaymentType) || 'card',
          status: 'pending',
          success_redirect_url: successUrl,
          error_redirect_url: errorUrl,
          metadata: {
            type: 'upgrade_pro',
            user_email: user.email,
          },
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Erreur enregistrement paiement:', paymentError);
        // On continue quand même car la charge Bictorys est créée
      } else {
        payment = paymentData;
      }
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      // On continue quand même car la charge Bictorys est créée
    }

    return NextResponse.json({
      success: true,
      chargeId: chargeResponse.id,
      checkoutUrl: chargeResponse.checkout_url,
      paymentId: payment?.id,
    });
  } catch (error: any) {
    console.error('Erreur création charge upgrade:', error);
    console.error('Stack:', error.stack);
    
    // Message d'erreur plus détaillé
    const errorMessage = error.message || 'Erreur lors de la création du paiement';
    
    // Vérifier si c'est une erreur de configuration
    if (errorMessage.includes('BICTORYS_API_KEY_PUBLIC')) {
      return NextResponse.json(
        { error: 'Configuration API manquante. Vérifiez les variables d\'environnement.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
*/