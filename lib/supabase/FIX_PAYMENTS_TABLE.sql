-- Correction de la table payments pour enregistrer correctement les paiements Stripe
-- À exécuter dans Supabase SQL Editor

-- Vérifier et ajouter les colonnes manquantes
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe' CHECK (payment_provider IN ('bictorys', 'stripe')),
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', NULL)),
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;

-- Mettre à jour le check constraint pour payment_type
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE payments
ADD CONSTRAINT payments_payment_type_check
CHECK (payment_type IN ('orange_money', 'wave', 'card', 'stripe', 'stripe_card', 'stripe_subscription', 'checkout'));

-- Index pour optimisation
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer ON payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_subscription ON payments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_status ON payments(subscription_status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id_status ON payments(user_id, status);

-- Mettre à jour la table users pour stocker les infos Stripe
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index sur users
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);

-- Vérifier que les politiques RLS permettent l'insertion
-- Les utilisateurs doivent pouvoir insérer leurs propres paiements
DO $$
BEGIN
  -- Vérifier si la politique existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users can create their own payments'
  ) THEN
    CREATE POLICY "Users can create their own payments"
      ON payments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Commentaires
COMMENT ON COLUMN payments.payment_provider IS 'Fournisseur de paiement: bictorys (Wave/Orange Money) ou stripe (abonnements)';
COMMENT ON COLUMN payments.stripe_session_id IS 'ID de la session Stripe Checkout';
COMMENT ON COLUMN payments.stripe_customer_id IS 'ID du client Stripe';
COMMENT ON COLUMN payments.stripe_subscription_id IS 'ID de l''abonnement Stripe';
COMMENT ON COLUMN payments.subscription_status IS 'Statut de l''abonnement Stripe';
COMMENT ON COLUMN payments.is_subscription IS 'Indique si c''est un paiement d''abonnement récurrent';
COMMENT ON COLUMN users.stripe_customer_id IS 'ID du client dans Stripe';
COMMENT ON COLUMN users.stripe_subscription_id IS 'ID de l''abonnement Stripe actif';
