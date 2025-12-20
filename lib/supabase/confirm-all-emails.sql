-- Script pour confirmer tous les emails existants
-- À exécuter dans Supabase SQL Editor

-- Confirmer tous les emails non confirmés
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Vérifier le résultat
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

