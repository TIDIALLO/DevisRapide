-- Fix RLS Policy pour permettre l'INSERT après signUp
-- À exécuter dans Supabase SQL Editor

-- S'assurer que la policy permet l'INSERT avec auth.uid()
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" 
  ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Vérifier les permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;

-- Si tu veux aussi permettre l'INSERT via le trigger (SECURITY DEFINER)
-- alors la fonction handle_new_user() doit avoir SECURITY DEFINER
-- (ce qui est déjà le cas dans ton script)

