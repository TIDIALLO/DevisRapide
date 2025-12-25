-- ============================================
-- FIX DÉFINITIF : Résoudre l'erreur RLS pour quotes
-- ============================================
-- Ce script résout définitivement l'erreur RLS pour la table quotes
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- 1. Accorder les privilèges nécessaires sur les tables quotes et quote_items
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE quotes TO anon, authenticated, service_role;
GRANT ALL ON TABLE quote_items TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. S'assurer que RLS est activé
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques existantes pour quotes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quotes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON quotes CASCADE';
    END LOOP;
END $$;

-- 4. Supprimer TOUTES les politiques existantes pour quote_items
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quote_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON quote_items CASCADE';
    END LOOP;
END $$;

-- 5. Recréer les politiques pour quotes avec des noms uniques

-- Politique SELECT : Les utilisateurs authentifiés peuvent lire leurs propres quotes
CREATE POLICY "quotes_select_own" ON quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique INSERT : Les utilisateurs authentifiés peuvent créer des quotes
-- IMPORTANT : 
-- - TO authenticated garantit que l'utilisateur est authentifié
-- - WITH CHECK vérifie que auth.uid() n'est pas NULL ET qu'il correspond à user_id
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

-- 6. Recréer les politiques pour quote_items

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

-- 7. Créer ou remplacer la fonction generate_quote_number
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

-- 8. Accorder les permissions sur la fonction
GRANT EXECUTE ON FUNCTION generate_quote_number(UUID) TO authenticated, anon;

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

-- 10. Vérifier les privilèges
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('quotes', 'quote_items')
  AND grantee IN ('anon', 'authenticated', 'service_role');

-- 11. Test de diagnostic : Vérifier auth.uid() pour l'utilisateur actuel
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Aucun utilisateur authentifié - Les cookies de session ne sont pas transmis'
    ELSE '✅ Utilisateur authentifié: ' || auth.uid()::text
  END as status;

-- ============================================
-- Explication de l'erreur RLS
-- ============================================
-- L'erreur "new row violates row-level security policy" se produit quand :
-- 1. auth.uid() retourne NULL (session non transmise dans la requête HTTP)
-- 2. auth.uid() ne correspond pas au user_id inséré
-- 3. Les politiques RLS ne sont pas correctement configurées
-- 4. Les privilèges ne sont pas accordés aux rôles
--
-- Solutions appliquées :
-- - Politiques RLS avec TO authenticated pour garantir l'authentification
-- - Vérification explicite de auth.uid() IS NOT NULL
-- - Accorder les privilèges nécessaires aux rôles
-- ============================================

