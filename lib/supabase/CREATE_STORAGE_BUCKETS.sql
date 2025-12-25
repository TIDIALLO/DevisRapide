-- ============================================
-- CRÉATION DES BUCKETS SUPABASE STORAGE
-- ============================================
-- Ce script crée les buckets nécessaires pour stocker les logos et signatures
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- Note: Les buckets Supabase Storage ne peuvent pas être créés directement via SQL
-- Ils doivent être créés via l'interface Supabase Dashboard ou l'API REST
-- 
-- INSTRUCTIONS MANUELLES :
-- 1. Aller dans Supabase Dashboard → Storage
-- 2. Cliquer sur "New bucket"
-- 3. Créer le bucket "logos" avec les paramètres suivants :
--    - Name: logos
--    - Public: Yes (pour que les images soient accessibles publiquement)
--    - File size limit: 5 MB
--    - Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif, image/webp
--
-- 4. Créer les politiques RLS pour le bucket (voir ci-dessous)

-- ============================================
-- POLITIQUES RLS POUR LE BUCKET "logos"
-- ============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can upload their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read logos" ON storage.objects;

-- Politique INSERT : Les utilisateurs authentifiés peuvent uploader leurs logos/signatures
CREATE POLICY "Users can upload their own logos" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    OR name LIKE 'signature-%'
    OR name LIKE auth.uid()::text || '-%'
  );

-- Politique SELECT : Tout le monde peut lire les logos (public)
CREATE POLICY "Public can read logos" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'logos');

-- Politique UPDATE : Les utilisateurs authentifiés peuvent modifier leurs logos
CREATE POLICY "Users can update their own logos" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE 'signature-' || auth.uid()::text || '-%'
      OR name LIKE auth.uid()::text || '-%'
    )
  )
  WITH CHECK (
    bucket_id = 'logos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE 'signature-' || auth.uid()::text || '-%'
      OR name LIKE auth.uid()::text || '-%'
    )
  );

-- Politique DELETE : Les utilisateurs authentifiés peuvent supprimer leurs logos
CREATE POLICY "Users can delete their own logos" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE 'signature-' || auth.uid()::text || '-%'
      OR name LIKE auth.uid()::text || '-%'
    )
  );

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les politiques ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Le bucket "logos" doit être créé manuellement dans Supabase Dashboard
-- 2. Le bucket doit être PUBLIC pour que les images soient accessibles
-- 3. Les politiques RLS permettent :
--    - Upload par les utilisateurs authentifiés (leurs propres fichiers)
--    - Lecture publique (pour afficher les logos/signatures)
--    - Modification/suppression uniquement par le propriétaire
-- ============================================

