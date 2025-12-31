-- Table pour stocker les transactions de paiement Bictorys
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  bictorys_charge_id TEXT UNIQUE,  -- ID de la transaction Bictorys
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('orange_money', 'wave', 'card')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  success_redirect_url TEXT,
  error_redirect_url TEXT,
  metadata JSONB DEFAULT '{}',  -- Données supplémentaires (quote_number, client_name, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_quote_id ON payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_payments_bictorys_charge_id ON payments(bictorys_charge_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Row Level Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres paiements
CREATE POLICY "Users can create their own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres paiements
CREATE POLICY "Users can update their own payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE payments IS 'Table pour stocker les transactions de paiement via Bictorys';
COMMENT ON COLUMN payments.bictorys_charge_id IS 'ID unique de la transaction retourné par Bictorys';
COMMENT ON COLUMN payments.payment_type IS 'Type de paiement: orange_money, wave, ou card';
COMMENT ON COLUMN payments.status IS 'Statut du paiement: pending, succeeded, failed, canceled';
COMMENT ON COLUMN payments.metadata IS 'Données supplémentaires au format JSON (quote_number, client_name, etc.)';
