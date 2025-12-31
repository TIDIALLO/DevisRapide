-- ============================================
-- VÉRIFICATION DES POLITIQUES RLS DU BUCKET "logos"
-- ============================================
-- Ce script vérifie l'état actuel des politiques RLS pour le bucket "logos"
-- Exécuter ce script pour diagnostiquer les problèmes de permissions
-- ============================================

-- 1. Vérifier que le bucket existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'logos';

-- 2. Vérifier les politiques RLS existantes pour le bucket "logos"
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
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (
    qual::text LIKE '%logos%'
    OR with_check::text LIKE '%logos%'
    OR policyname LIKE '%logos%'
  )
ORDER BY policyname;

-- 3. Compter le nombre de politiques pour le bucket "logos"
SELECT 
  COUNT(*) as nombre_politiques
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (
    qual::text LIKE '%logos%'
    OR with_check::text LIKE '%logos%'
    OR policyname LIKE '%logos%'
  );

-- 4. Vérifier les permissions de base pour storage.objects
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'storage'
  AND table_name = 'objects';

