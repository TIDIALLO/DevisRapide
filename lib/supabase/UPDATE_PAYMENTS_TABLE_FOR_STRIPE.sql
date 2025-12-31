-- Ajouter le support Stripe à la table payments
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne stripe_session_id
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;

-- Mettre à jour le CHECK pour payment_type pour inclure 'stripe'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('orange_money', 'wave', 'card', 'stripe', 'checkout'));

-- Index pour stripe_session_id
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON payments(stripe_session_id);

-- Commentaire
COMMENT ON COLUMN payments.stripe_session_id IS 'ID de la session Stripe Checkout';
COMMENT ON COLUMN payments.payment_type IS 'Type de paiement: orange_money, wave, card, stripe, ou checkout';
