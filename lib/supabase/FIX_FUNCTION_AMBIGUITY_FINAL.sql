-- ============================================
-- FIX FINAL : Résoudre l'ambiguïté de la fonction create_user_profile
-- ============================================
-- Ce script supprime TOUTES les versions existantes et crée une seule version
-- avec des paramètres nommés pour éviter toute ambiguïté
-- ============================================
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- ============================================

-- Supprimer TOUTES les versions existantes de la fonction (tous les ordres possibles)
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

-- Créer UNE SEULE version de la fonction avec l'ordre utilisé dans le code TypeScript
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
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email AND id != p_user_id) THEN
    RAISE EXCEPTION 'Cet email est déjà associé à un autre compte. Si vous avez déjà un compte, connectez-vous. Sinon, utilisez une autre adresse email.';
  END IF;

  -- Vérifier si le téléphone existe déjà
  IF EXISTS (SELECT 1 FROM public.users WHERE phone = p_phone AND id != p_user_id) THEN
    RAISE EXCEPTION 'Ce numéro de téléphone est déjà associé à un autre compte. Veuillez utiliser un autre numéro.';
  END IF;

  -- Insérer ou mettre à jour le profil
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

-- Accorder les permissions (IMPORTANT : spécifier exactement les types dans l'ordre)
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Vérifier que la fonction a été créée correctement
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================
-- Résultat attendu :
-- Une seule fonction avec la signature :
-- create_user_profile(p_user_id uuid, p_email text, p_phone text, p_full_name text, p_profession text, p_address text)
-- ============================================

