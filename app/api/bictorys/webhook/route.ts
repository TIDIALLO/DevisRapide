import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseWebhookPayload, verifyWebhookSignature } from '@/lib/bictorys/webhook';

export async function POST(request: NextRequest) {
  try {
    // Récupérer la signature du header
    const signature = request.headers.get('x-bictorys-signature') || 
                      request.headers.get('x-signature');

    // Lire le corps de la requête
    const body = await request.text();
    const payload = JSON.parse(body);

    // Valider la signature (si configurée)
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Signature webhook invalide');
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 401 }
      );
    }

    // Parser le payload
    const webhookData = parseWebhookPayload(payload);
    if (!webhookData) {
      return NextResponse.json(
        { error: 'Payload invalide' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Trouver le paiement correspondant
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*, quote:quotes(*)')
      .eq('bictorys_charge_id', webhookData.data.id)
      .single();

    if (findError || !payment) {
      console.error('Paiement non trouvé:', findError);
      // On retourne 200 pour éviter que Bictorys réessaie
      return NextResponse.json({ received: true });
    }

    // Mettre à jour le statut du paiement
    const newStatus = webhookData.data.status;
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Erreur mise à jour paiement:', updateError);
    }

    // Si le paiement a réussi
    if (newStatus === 'succeeded') {
      // Si c'est un upgrade PRO
      if (payment.metadata?.type === 'upgrade_pro') {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mois

        await supabase
          .from('users')
          .update({
            plan: 'pro',
            plan_expires_at: expiresAt.toISOString(),
          })
          .eq('id', payment.user_id);
      }
      // Si c'est un paiement de facture
      else if (payment.quote_id) {
        // Optionnel : Mettre à jour le statut de la facture
        await supabase
          .from('quotes')
          .update({
            updated_at: new Date().toISOString(),
            // Vous pouvez ajouter un champ payment_status si nécessaire
          })
          .eq('id', payment.quote_id);
      }
    }

    // Log pour debug
    console.log(`Webhook reçu: ${webhookData.event} pour charge ${webhookData.data.id}`);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error);
    // On retourne 200 pour éviter que Bictorys réessaie en boucle
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 200 }
    );
  }
}

// GET pour vérifier que l'endpoint est accessible
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint Bictorys',
    status: 'active'
  });
}
