// Client Stripe pour les abonnements PRO
import Stripe from 'stripe';

// Fonction pour créer le client Stripe de manière lazy
// Cela évite les erreurs au build si les variables d'environnement ne sont pas configurées
let stripeInstance: Stripe | null = null;

function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  });
}

// Export d'un objet proxy qui initialise le client seulement quand nécessaire
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!stripeInstance) {
      stripeInstance = createStripeClient();
    }
    const value = stripeInstance[prop as keyof Stripe];
    if (typeof value === 'function') {
      return value.bind(stripeInstance);
    }
    return value;
  },
}) as Stripe;

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_1SjUlLPtXAmC1Epufb0TiZAq';
export const STRIPE_PAYMENT_LINK = process.env.STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_dRm5kFc3O9hb3968ww';
