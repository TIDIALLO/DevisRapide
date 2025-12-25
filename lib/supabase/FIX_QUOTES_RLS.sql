-- ============================================
-- FIX : Résoudre les erreurs 403/404 pour quotes et generate_quote_number
-- ============================================
-- Ce script corrige les politiques RLS pour quotes et crée la fonction generate_quote_number
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- 1. Créer ou remplacer la fonction generate_quote_number
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Accorder les permissions sur la fonction
GRANT EXECUTE ON FUNCTION generate_quote_number(UUID) TO authenticated, anon;

-- 3. Accorder les privilèges sur la table quotes
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE quotes TO anon, authenticated, service_role;
GRANT ALL ON TABLE quote_items TO anon, authenticated, service_role;

-- 4. S'assurer que RLS est activé
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer TOUTES les politiques existantes pour quotes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quotes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON quotes CASCADE';
    END LOOP;
END $$;

-- 6. Supprimer TOUTES les politiques existantes pour quote_items
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quote_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON quote_items CASCADE';
    END LOOP;
END $$;

-- 7. Recréer les politiques pour quotes

-- Politique SELECT : Les utilisateurs authentifiés peuvent lire leurs propres quotes
CREATE POLICY "quotes_select_own" ON quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique INSERT : Les utilisateurs authentifiés peuvent créer des quotes
CREATE POLICY "quotes_insert_own" ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- Politique UPDATE : Les utilisateurs authentifiés peuvent modifier leurs propres quotes
CREATE POLICY "quotes_update_own" ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique DELETE : Les utilisateurs authentifiés peuvent supprimer leurs propres quotes
CREATE POLICY "quotes_delete_own" ON quotes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. Recréer les politiques pour quote_items

-- Politique SELECT : Les utilisateurs peuvent lire les items de leurs quotes
CREATE POLICY "quote_items_select_own" ON quote_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Politique INSERT : Les utilisateurs peuvent créer des items pour leurs quotes
CREATE POLICY "quote_items_insert_own" ON quote_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Politique UPDATE : Les utilisateurs peuvent modifier les items de leurs quotes
CREATE POLICY "quote_items_update_own" ON quote_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Politique DELETE : Les utilisateurs peuvent supprimer les items de leurs quotes
CREATE POLICY "quote_items_delete_own" ON quote_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- 9. Vérifier que les politiques ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('quotes', 'quote_items')
ORDER BY tablename, policyname;

-- 10. Vérifier que la fonction existe
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'generate_quote_number';

-- ============================================
-- Explication des erreurs
-- ============================================
-- 404 pour generate_quote_number :
-- - La fonction n'existe pas ou n'est pas accessible
-- - Solution : Créer la fonction avec SECURITY DEFINER et accorder EXECUTE
--
-- 403 pour quotes :
-- - Les politiques RLS bloquent l'accès
-- - auth.uid() retourne NULL ou ne correspond pas au user_id
-- - Solution : Vérifier les politiques et s'assurer que auth.uid() est transmis
-- ============================================

