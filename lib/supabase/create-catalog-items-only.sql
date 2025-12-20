-- Script pour créer uniquement la table catalog_items
-- À exécuter dans Supabase SQL Editor

-- Enable UUID extension (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la table catalog_items
CREATE TABLE IF NOT EXISTS catalog_items (
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

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id ON catalog_items(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category);

-- Enable Row Level Security
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (DROP puis CREATE car CREATE POLICY IF NOT EXISTS n'existe pas)
DROP POLICY IF EXISTS "Users can read own catalog items" ON catalog_items;
CREATE POLICY "Users can read own catalog items" ON catalog_items
  FOR SELECT USING (auth.uid() = user_id OR is_template = TRUE);

DROP POLICY IF EXISTS "Users can create own catalog items" ON catalog_items;
CREATE POLICY "Users can create own catalog items" ON catalog_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own catalog items" ON catalog_items;
CREATE POLICY "Users can update own catalog items" ON catalog_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own catalog items" ON catalog_items;
CREATE POLICY "Users can delete own catalog items" ON catalog_items
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger pour updated_at (si la fonction existe déjà)
DROP TRIGGER IF EXISTS update_catalog_items_updated_at ON catalog_items;
CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.catalog_items TO authenticated;

