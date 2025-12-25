-- ============================================
-- FIX FINAL : Fonction create_user_profile
-- ============================================
-- Cette fonction DOIT être créée dans Supabase SQL Editor
-- 
-- IMPORTANT : 
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Vider le cache Supabase après (Settings > API > Clear cache ou attendre 1-2 minutes)
-- ============================================

-- Supprimer TOUTES les versions existantes de la fonction
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

-- Créer la fonction avec l'ordre exact utilisé dans le code TypeScript
-- Ordre dans le code : p_user_id, p_email, p_phone, p_full_name, p_profession, p_address
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_phone TEXT,
  p_full_name TEXT,
  p_profession TEXT,
  p_address TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    full_name,
    profession,
    address,
    plan
  )
  VALUES (
    p_user_id,
    p_email,
    p_phone,
    p_full_name,
    p_profession,
    COALESCE(p_address, NULL),
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    profession = EXCLUDED.profession,
    address = EXCLUDED.address,
    updated_at = NOW();
END;
$$;

-- Accorder les permissions (IMPORTANT : spécifier tous les types de paramètres)
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Vérifier que la fonction existe avec la bonne signature
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  proargnames as parameter_names
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonction create_user_profile créée avec succès !';
  RAISE NOTICE 'Signature: create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT)';
  RAISE NOTICE 'Paramètres: p_user_id, p_email, p_phone, p_full_name, p_profession, p_address';
END $$;

