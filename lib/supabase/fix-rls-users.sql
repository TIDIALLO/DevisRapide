-- Fix RLS pour la table users
-- À exécuter dans Supabase SQL Editor

-- Supprimer le trigger qui crée automatiquement le profil
-- (on laisse le code frontend faire l'INSERT directement)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- S'assurer que les policies RLS permettent l'INSERT
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" 
  ON users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Vérifier que les permissions sont correctes
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;

