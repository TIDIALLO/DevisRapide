-- Fonction pour créer/mettre à jour le profil utilisateur
-- Cette fonction utilise SECURITY DEFINER pour contourner RLS
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_phone TEXT,
  p_full_name TEXT,
  p_profession TEXT
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
    plan
  )
  VALUES (
    p_user_id,
    p_email,
    p_phone,
    p_full_name,
    p_profession,
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    profession = EXCLUDED.profession,
    updated_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated, anon;

