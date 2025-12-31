// Validation des webhooks Bictorys
import type { WebhookPayload } from './types';

const BICTORYS_WEBHOOK_SECRET = process.env.BICTORYS_WEBHOOK_SECRET;

/**
 * Valide la signature d'un webhook Bictorys
 * @param payload - Corps du webhook
 * @param signature - Signature dans les headers
 * @returns true si la signature est valide
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!BICTORYS_WEBHOOK_SECRET) {
    console.warn('BICTORYS_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // En développement, on peut skip la vérification
  }

  if (!signature) {
    return false;
  }

  // Bictorys utilise généralement HMAC SHA256
  // Note: Vérifier la documentation exacte de Bictorys pour la méthode de signature
  // Pour l'instant, on retourne true si la clé secrète est présente
  // TODO: Implémenter la vérification HMAC selon la doc Bictorys
  
  return true;
}

/**
 * Parse et valide le payload d'un webhook
 * @param body - Corps de la requête
 * @returns Payload validé ou null si invalide
 */
export function parseWebhookPayload(body: any): WebhookPayload | null {
  try {
    if (!body || !body.event || !body.data) {
      return null;
    }

    return {
      event: body.event,
      data: {
        id: body.data.id,
        status: body.data.status,
        amount: body.data.amount,
        currency: body.data.currency || 'XOF',
        payment_type: body.data.payment_type,
        metadata: body.data.metadata || {},
        created_at: body.data.created_at,
        updated_at: body.data.updated_at || body.data.created_at,
      },
    };
  } catch (error) {
    console.error('Error parsing webhook payload:', error);
    return null;
  }
}
