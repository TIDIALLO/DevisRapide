-- ============================================
-- SCRIPT COMPLET POUR LA BASE DE PRODUCTION
-- ============================================
-- ⚠️ IMPORTANT : Ce script doit être exécuté dans le projet Supabase
-- utilisé par Vercel en PRODUCTION (pas votre base locale)
-- 
-- Vérifiez que vous êtes dans le bon projet :
-- URL du projet : https://mtborwdznqasahyageej.supabase.co
-- ============================================

-- ============================================
-- 1. Fonction create_user_profile
-- ============================================

-- Supprimer TOUTES les versions existantes
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

-- Créer la fonction avec l'ordre EXACT que Supabase cherche dans l'erreur
-- Ordre dans l'erreur : p_address, p_email, p_full_name, p_phone, p_profession, p_user_id
-- NOTE: p_address doit être en dernier car il a une valeur par défaut
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_profession TEXT,
  p_user_id UUID,
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

GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO service_role;

-- ============================================
-- 2. Fonction import_catalog_items
-- ============================================

DROP FUNCTION IF EXISTS public.import_catalog_items(UUID, JSONB);
DROP FUNCTION IF EXISTS public.import_catalog_items(UUID);

CREATE OR REPLACE FUNCTION public.import_catalog_items(
  p_user_id UUID,
  p_items JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  inserted_count INTEGER := 0;
BEGIN
  -- Parcourir chaque item et l'insérer
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.catalog_items (
      user_id,
      name,
      description,
      unit_price,
      unit,
      category,
      is_template
    )
    VALUES (
      p_user_id,
      item->>'name',
      NULLIF(item->>'description', 'null'),
      (item->>'unit_price')::DECIMAL(15, 2),
      item->>'unit',
      NULLIF(item->>'category', 'null'),
      COALESCE((item->>'is_template')::BOOLEAN, FALSE)
    )
    ON CONFLICT DO NOTHING;
    
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_catalog_items(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_catalog_items(UUID, JSONB) TO anon;

-- ============================================
-- 3. Forcer le rafraîchissement du cache PostgREST
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- 4. Vérification
-- ============================================
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  proargnames as parameter_names,
  CASE 
    WHEN proname = 'create_user_profile' AND proargnames = ARRAY['p_email', 'p_full_name', 'p_phone', 'p_profession', 'p_user_id', 'p_address'] 
    THEN '✅ create_user_profile - Créée (p_address en dernier)'
    WHEN proname = 'import_catalog_items' AND proargnames = ARRAY['p_user_id', 'p_items']
    THEN '✅ import_catalog_items - Créée'
    ELSE '❌ Vérifier la fonction'
  END as verification
FROM pg_proc
WHERE proname IN ('create_user_profile', 'import_catalog_items')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TOUTES LES FONCTIONS CRÉÉES EN PRODUCTION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. create_user_profile - Créée';
  RAISE NOTICE '2. import_catalog_items - Créée';
  RAISE NOTICE 'Cache PostgREST rafraîchi';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⏳ Attendre 30 secondes à 2 minutes';
  RAISE NOTICE 'Puis tester la création de compte en production';
  RAISE NOTICE '========================================';
END $$;

