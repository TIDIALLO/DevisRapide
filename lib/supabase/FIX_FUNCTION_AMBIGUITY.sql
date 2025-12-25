-- ============================================
-- FIX DÉFINITIF : Supprimer toutes les versions
-- de create_user_profile et créer une seule version
-- ============================================
-- Ce script résout l'erreur :
-- "Could not choose the best candidate function between: ..."
-- ============================================

-- Supprimer TOUTES les versions existantes (avec CASCADE pour supprimer les dépendances)
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

-- Supprimer aussi toutes les versions avec signatures spécifiques
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(p_user_id UUID, p_email TEXT, p_phone TEXT, p_full_name TEXT, p_profession TEXT, p_address TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(p_email TEXT, p_full_name TEXT, p_phone TEXT, p_profession TEXT, p_user_id UUID, p_address TEXT) CASCADE;

-- Attendre un peu pour que PostgreSQL libère les ressources
DO $$ BEGIN
  PERFORM pg_sleep(0.1);
END $$;

-- Créer UNE SEULE version de la fonction avec l'ordre exact utilisé dans le code TypeScript
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
  -- Vérifier si l'email existe déjà avec un autre id
  IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email AND id != p_user_id) THEN
    RAISE EXCEPTION 'Cet email est déjà utilisé par un autre compte'
      USING ERRCODE = '23505', 
            HINT = 'Essayez de vous connecter ou utilisez un autre email';
  END IF;

  -- Vérifier si le téléphone existe déjà avec un autre id
  IF EXISTS (SELECT 1 FROM public.users WHERE phone = p_phone AND id != p_user_id) THEN
    RAISE EXCEPTION 'Ce numéro de téléphone est déjà utilisé par un autre compte'
      USING ERRCODE = '23505', 
            HINT = 'Essayez de vous connecter ou utilisez un autre numéro';
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

-- Accorder les permissions (spécifier la signature exacte)
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Vérifier que la fonction a été créée correctement
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Fonction create_user_profile créée avec succès';
  RAISE NOTICE '✅ Toutes les anciennes versions ont été supprimées';
  RAISE NOTICE '✅ Signature: (p_user_id UUID, p_email TEXT, p_phone TEXT, p_full_name TEXT, p_profession TEXT, p_address TEXT DEFAULT NULL)';
END $$;

