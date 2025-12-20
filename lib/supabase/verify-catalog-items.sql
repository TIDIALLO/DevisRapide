-- Script de vérification pour la table catalog_items
-- À exécuter dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Vérifier que la table existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'catalog_items';

-- 2. Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'catalog_items'
ORDER BY ordinal_position;

-- 3. Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'catalog_items';

-- 4. Vérifier les policies RLS
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
WHERE schemaname = 'public' 
  AND tablename = 'catalog_items';

-- 5. Vérifier les permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'catalog_items';

