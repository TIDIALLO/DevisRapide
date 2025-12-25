-- ============================================
-- FIX COMPLET : create_user_profile + Cache Refresh
-- ============================================
-- Ce script :
-- 1. Supprime toutes les anciennes versions de la fonction
-- 2. Crée la fonction avec la bonne signature
-- 3. Force le rafraîchissement du cache PostgREST
-- ============================================

-- ============================================
-- ÉTAPE 1 : Supprimer toutes les anciennes versions
-- ============================================
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

-- ============================================
-- ÉTAPE 2 : Créer la fonction avec la bonne signature
-- ============================================
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

-- ============================================
-- ÉTAPE 3 : Accorder les permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- ============================================
-- ÉTAPE 4 : Forcer le rafraîchissement du cache PostgREST
-- ============================================
-- Cette commande notifie PostgREST de recharger le schéma
NOTIFY pgrst, 'reload schema';

-- ============================================
-- ÉTAPE 5 : Vérification
-- ============================================
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  proargnames as parameter_names,
  CASE 
    WHEN proargnames = ARRAY['p_user_id', 'p_email', 'p_phone', 'p_full_name', 'p_profession', 'p_address'] 
    THEN '✅ Ordre correct'
    ELSE '❌ Ordre incorrect'
  END as verification
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Fonction create_user_profile créée !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Signature: create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT)';
  RAISE NOTICE 'Paramètres: p_user_id, p_email, p_phone, p_full_name, p_profession, p_address';
  RAISE NOTICE 'Cache PostgREST rafraîchi';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⏳ Attendre 30 secondes avant de tester';
  RAISE NOTICE '========================================';
END $$;

