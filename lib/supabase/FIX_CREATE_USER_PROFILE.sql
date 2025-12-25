-- ============================================
-- FIX : Fonction create_user_profile
-- ============================================
-- Cette fonction doit être créée dans Supabase SQL Editor
-- L'ordre des paramètres correspond exactement à l'appel dans le code TypeScript
--
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- Supprimer l'ancienne fonction si elle existe (pour éviter les conflits)
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile;

-- Créer la fonction avec l'ordre exact des paramètres utilisé dans le code
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

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

-- Vérifier que la fonction a été créée correctement
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

