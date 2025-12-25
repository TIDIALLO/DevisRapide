-- ============================================
-- Améliorer la fonction create_user_profile
-- pour mieux gérer les conflits d'email
-- ============================================

-- Supprimer l'ancienne version
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;

-- Créer la fonction améliorée
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
      USING ERRCODE = '23505', HINT = 'Essayez de vous connecter ou utilisez un autre email';
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

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Fonction create_user_profile améliorée avec gestion des conflits d''email';
END $$;

