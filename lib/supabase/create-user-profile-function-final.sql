-- Fonction pour créer/mettre à jour le profil utilisateur
-- Cette fonction utilise SECURITY DEFINER pour contourner RLS
-- À exécuter dans Supabase SQL Editor
-- 
-- IMPORTANT : L'ordre des paramètres doit correspondre exactement à l'appel dans le code

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
    p_address,
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- Vérifier que la fonction existe
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

