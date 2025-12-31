-- Mise à jour de la table payments pour Stripe
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne stripe_session_id si elle n'existe pas
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;

-- Ajouter la colonne stripe_checkout_url pour les liens publics Stripe
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;

-- Mettre à jour le CHECK pour payment_type pour inclure 'stripe'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('orange_money', 'wave', 'card', 'stripe', 'checkout'));

-- Index pour stripe_session_id
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON payments(stripe_session_id);

-- Index pour stripe_checkout_url
CREATE INDEX IF NOT EXISTS idx_payments_stripe_checkout_url ON payments(stripe_checkout_url);

-- Commentaires
COMMENT ON COLUMN payments.stripe_session_id IS 'ID de la session Stripe Checkout (si créée via API)';
COMMENT ON COLUMN payments.stripe_checkout_url IS 'URL publique Stripe Checkout (lien direct)';
COMMENT ON COLUMN payments.payment_type IS 'Type de paiement: orange_money, wave, card, stripe, ou checkout';
