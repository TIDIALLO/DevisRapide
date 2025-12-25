-- ============================================
-- FIX V2 : Politiques RLS pour la table clients (Version améliorée)
-- ============================================
-- Ce script corrige les politiques RLS pour permettre la création de clients
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- 1. S'assurer que RLS est activé
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
DROP POLICY IF EXISTS "Users can create own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- 3. Recréer les politiques avec les bonnes conditions

-- Politique SELECT : Les utilisateurs peuvent lire leurs propres clients
CREATE POLICY "Users can read own clients" ON clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique INSERT : Les utilisateurs peuvent créer des clients avec leur propre user_id
-- IMPORTANT : 
-- - WITH CHECK vérifie que le user_id inséré correspond à l'utilisateur authentifié
-- - On vérifie aussi que auth.uid() n'est pas NULL (utilisateur authentifié)
-- - On utilise COALESCE pour gérer les cas où auth.uid() pourrait être NULL
CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- Politique UPDATE : Les utilisateurs peuvent modifier leurs propres clients
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique DELETE : Les utilisateurs peuvent supprimer leurs propres clients
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Vérifier que les politiques ont été créées
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
WHERE tablename = 'clients'
ORDER BY policyname;

-- 5. Test de diagnostic : Vérifier que auth.uid() fonctionne
-- Cette requête doit retourner l'ID de l'utilisateur authentifié
-- (À exécuter après s'être connecté dans Supabase Dashboard)
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Aucun utilisateur authentifié'
    ELSE '✅ Utilisateur authentifié: ' || auth.uid()::text
  END as status;

-- ============================================
-- Explication de l'erreur 403
-- ============================================
-- L'erreur 403 (Forbidden) avec RLS se produit quand :
-- 1. auth.uid() retourne NULL (pas de session transmise)
-- 2. auth.uid() ne correspond pas au user_id inséré
-- 3. Les politiques RLS ne sont pas correctement configurées
--
-- Causes possibles :
-- - La session n'est pas correctement transmise depuis le client
-- - Les cookies de session ne sont pas présents ou expirés
-- - Le client Supabase n'utilise pas la bonne clé API
--
-- Solutions :
-- - Vérifier que la session est valide avec getSession()
-- - S'assurer que user_id correspond à auth.uid()
-- - Vérifier les cookies dans le navigateur (Application > Cookies)
-- - Se reconnecter si la session a expiré
-- ============================================

