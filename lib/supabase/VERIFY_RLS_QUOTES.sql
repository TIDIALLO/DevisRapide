-- ============================================
-- VÉRIFICATION DES POLITIQUES RLS POUR QUOTES
-- ============================================
-- Ce script vérifie que les politiques RLS sont correctement configurées
-- Exécuter ce script pour diagnostiquer les problèmes RLS
-- ============================================

-- 1. Vérifier que les politiques existent
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

-- 2. Vérifier les privilèges
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('quotes', 'quote_items')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 3. Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('quotes', 'quote_items')
  AND schemaname = 'public';

-- 4. Vérifier la fonction generate_quote_number
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'generate_quote_number';

-- 5. Test de la politique INSERT (nécessite d'être connecté)
-- Remplacez 'VOTRE_USER_ID' par votre user_id réel
-- SELECT auth.uid() as current_user_id;
-- 
-- Si auth.uid() retourne NULL, la session n'est pas transmise correctement
-- Si auth.uid() retourne un UUID, la session est correcte

-- 6. Vérifier la structure de la table quotes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'quotes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- INTERPRÉTATION DES RÉSULTATS
-- ============================================
-- 
-- ✅ RÉSULTAT ATTENDU :
-- - 4 politiques pour 'quotes' (SELECT, INSERT, UPDATE, DELETE)
-- - 4 politiques pour 'quote_items' (SELECT, INSERT, UPDATE, DELETE)
-- - Tous les privilèges accordés à 'authenticated'
-- - RLS activé (rowsecurity = true)
-- - Fonction generate_quote_number existe
--
-- ❌ PROBLÈME SI :
-- - Moins de 8 politiques au total → Exécuter FIX_QUOTES_RLS_DEFINITIVE.sql
-- - Privilèges manquants → Exécuter FIX_QUOTES_RLS_DEFINITIVE.sql
-- - RLS non activé → Exécuter FIX_QUOTES_RLS_DEFINITIVE.sql
-- - auth.uid() retourne NULL → Problème de session/cookies
-- ============================================

