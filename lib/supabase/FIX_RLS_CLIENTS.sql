-- ============================================
-- FIX : Politiques RLS pour la table clients
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
-- IMPORTANT : WITH CHECK vérifie que le user_id inséré correspond à l'utilisateur authentifié
-- On vérifie aussi que auth.uid() n'est pas NULL (utilisateur authentifié)
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

-- ============================================
-- Explication de l'erreur RLS
-- ============================================
-- L'erreur "new row violates row-level security policy" se produit quand :
-- 1. La politique INSERT vérifie que auth.uid() = user_id
-- 2. Si auth.uid() retourne NULL (pas de session), la condition échoue
-- 3. Si le user_id inséré ne correspond pas à auth.uid(), la condition échoue
--
-- Solutions :
-- - S'assurer que l'utilisateur est bien authentifié avant l'insertion
-- - Vérifier que user_id correspond bien à auth.uid()
-- - Les politiques ci-dessus garantissent que seul l'utilisateur authentifié peut créer ses propres clients
-- ============================================

