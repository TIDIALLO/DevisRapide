-- ============================================
-- FIX DÉFINITIF : Politiques RLS pour la table clients
-- ============================================
-- Ce script résout définitivement l'erreur 403 (42501) lors de la création de clients
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- 1. Désactiver temporairement RLS pour vérifier la structure
-- (On le réactivera après)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes (y compris celles avec des noms différents)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clients') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON clients';
    END LOOP;
END $$;

-- 3. Recréer les politiques avec des noms uniques et des conditions claires

-- Politique SELECT : Les utilisateurs peuvent lire leurs propres clients
CREATE POLICY "clients_select_own" ON clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique INSERT : Les utilisateurs peuvent créer des clients
-- IMPORTANT : On vérifie que auth.uid() n'est pas NULL ET qu'il correspond à user_id
CREATE POLICY "clients_insert_own" ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- Politique UPDATE : Les utilisateurs peuvent modifier leurs propres clients
CREATE POLICY "clients_update_own" ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique DELETE : Les utilisateurs peuvent supprimer leurs propres clients
CREATE POLICY "clients_delete_own" ON clients
  FOR DELETE
  TO authenticated
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

-- 5. Test de diagnostic : Vérifier auth.uid() pour l'utilisateur actuel
-- (À exécuter après s'être connecté dans Supabase Dashboard)
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Aucun utilisateur authentifié - Les cookies de session ne sont pas transmis'
    ELSE '✅ Utilisateur authentifié: ' || auth.uid()::text
  END as status;

-- 6. Vérifier la structure de la table clients
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- ============================================
-- Explication de l'erreur 403 (42501)
-- ============================================
-- L'erreur "new row violates row-level security policy" se produit quand :
-- 1. auth.uid() retourne NULL (session non transmise dans la requête)
-- 2. auth.uid() ne correspond pas au user_id inséré
-- 3. Les politiques RLS ne sont pas correctement configurées
--
-- Causes possibles :
-- - Les cookies de session ne sont pas transmis dans la requête HTTP
-- - Le client Supabase n'utilise pas les cookies correctement
-- - La session a expiré côté serveur mais pas côté client
--
-- Solutions appliquées :
-- - Politiques RLS avec vérification explicite de auth.uid() IS NOT NULL
-- - Utilisation de TO authenticated pour s'assurer que l'utilisateur est authentifié
-- - Gestion explicite des cookies dans le client Supabase
-- ============================================

-- 7. Si le problème persiste, tester sans RLS (TEMPORAIRE - À NE PAS LAISSER EN PRODUCTION)
-- ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
-- (Tester la création d'un client)
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

