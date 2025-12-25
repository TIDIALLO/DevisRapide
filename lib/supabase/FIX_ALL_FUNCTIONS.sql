-- ============================================
-- FIX : Toutes les fonctions nécessaires
-- ============================================
-- Ce script crée toutes les fonctions RPC nécessaires pour l'application
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Fonction create_user_profile
-- ============================================

DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_profile;

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

GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

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
-- Vérification
-- ============================================

SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('create_user_profile', 'import_catalog_items')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

