-- ============================================
-- SCRIPT À EXÉCUTER DANS LA BASE DE PRODUCTION
-- ============================================
-- ⚠️ IMPORTANT : Ce script doit être exécuté dans le projet Supabase
-- utilisé par Vercel en PRODUCTION (pas votre base locale)
-- 
-- Vérifiez que vous êtes dans le bon projet :
-- URL du projet : https://mtborwdznqasahyageej.supabase.co
-- ============================================

-- Supprimer TOUTES les versions existantes
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

-- Créer la fonction avec l'ordre EXACT que Supabase cherche dans l'erreur
-- Ordre dans l'erreur : p_address, p_email, p_full_name, p_phone, p_profession, p_user_id
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_address TEXT DEFAULT NULL,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_profession TEXT,
  p_user_id UUID
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

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;

-- Forcer le rafraîchissement du cache PostgREST
NOTIFY pgrst, 'reload schema';

-- Vérification
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  proargnames as parameter_names,
  CASE 
    WHEN proargnames = ARRAY['p_address', 'p_email', 'p_full_name', 'p_phone', 'p_profession', 'p_user_id'] 
    THEN '✅ Ordre correspond à l''erreur - FONCTION CRÉÉE EN PRODUCTION'
    ELSE '❌ Ordre différent'
  END as verification
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FONCTION CRÉÉE EN PRODUCTION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Signature: create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID)';
  RAISE NOTICE 'Paramètres: p_address, p_email, p_full_name, p_phone, p_profession, p_user_id';
  RAISE NOTICE 'Cache PostgREST rafraîchi';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⏳ Attendre 30 secondes à 2 minutes';
  RAISE NOTICE 'Puis tester la création de compte en production';
  RAISE NOTICE '========================================';
END $$;

