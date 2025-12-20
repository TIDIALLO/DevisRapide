-- DevisRapide Database Schema
-- À exécuter dans le SQL Editor de Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT,
  profession TEXT NOT NULL CHECK (profession IN ('peintre', 'mecanicien', 'quincaillier', 'electricien', 'plombier', 'autre')),
  address TEXT,
  ninea TEXT,
  logo_url TEXT,
  signature_url TEXT,
  default_payment_terms TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog items table
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  category TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'refused', 'expired')),
  date DATE NOT NULL,
  valid_until DATE NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(15, 2),
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  notes TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quote_number)
);

-- Quote items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_catalog_items_user_id ON catalog_items(user_id);
CREATE INDEX idx_catalog_items_category ON catalog_items(category);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_date ON quotes(date);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_order ON quote_items("order");

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can only read/update their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients: users can only access their own clients
CREATE POLICY "Users can read own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Catalog items: users can only access their own items
CREATE POLICY "Users can read own catalog items" ON catalog_items
  FOR SELECT USING (auth.uid() = user_id OR is_template = TRUE);

CREATE POLICY "Users can create own catalog items" ON catalog_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catalog items" ON catalog_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catalog items" ON catalog_items
  FOR DELETE USING (auth.uid() = user_id);

-- Quotes: users can only access their own quotes
CREATE POLICY "Users can read own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON quotes
  FOR DELETE USING (auth.uid() = user_id);

-- Quote items: users can access items for their quotes
CREATE POLICY "Users can read own quote items" ON quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own quote items" ON quote_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own quote items" ON quote_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quote items" ON quote_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_items_updated_at BEFORE UPDATE ON catalog_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate next quote number
CREATE OR REPLACE FUNCTION generate_quote_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM quotes
  WHERE user_id = p_user_id;
  
  RETURN 'DEV-' || LPAD((v_count + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

