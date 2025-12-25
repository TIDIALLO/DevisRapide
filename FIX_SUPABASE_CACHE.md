# 🔧 Correction : Erreur create_user_profile - Cache Supabase

## ❌ Problème

L'erreur persiste même après avoir créé la fonction :
```
Could not find the function public.create_user_profile(p_address, p_email, p_full_name, p_phone, p_profession, p_user_id) in the schema cache
```

## 🔍 Analyse

Supabase utilise un **cache de schéma** qui peut mettre quelques minutes à se rafraîchir. L'erreur montre que Supabase cherche la fonction avec un ordre de paramètres différent, ce qui indique :
1. La fonction n'a peut-être pas été créée correctement
2. Le cache Supabase n'a pas été rafraîchi
3. Il y a peut-être un problème de permissions

## ✅ Solution complète (étape par étape)

### Étape 1 : Vérifier que la fonction existe

**Dans Supabase SQL Editor**, exécuter :

```sql
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  proargnames as parameter_names
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

**Résultat attendu** : Vous devriez voir une ligne avec :
- `function_name`: `create_user_profile`
- `arguments`: `UUID, TEXT, TEXT, TEXT, TEXT, TEXT`
- `parameter_names`: `{p_user_id,p_email,p_phone,p_full_name,p_profession,p_address}`

### Étape 2 : Recréer la fonction proprement

1. **Ouvrir** : https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql/new

2. **Copier-coller** le contenu de `lib/supabase/FIX_CREATE_USER_PROFILE_FINAL.sql`

3. **Exécuter** le script

### Étape 3 : Vider le cache Supabase

**Option A : Via l'interface (si disponible)**
1. Aller dans **Settings** > **API**
2. Chercher "Clear cache" ou "Refresh schema"
3. Cliquer sur le bouton

**Option B : Attendre**
- Attendre **2-3 minutes** pour que le cache se rafraîchisse automatiquement

**Option C : Via SQL (forcer le rafraîchissement)**
```sql
-- Forcer le rafraîchissement du cache PostgREST
NOTIFY pgrst, 'reload schema';
```

### Étape 4 : Vérifier les permissions RLS

Assurez-vous que la table `users` existe et que RLS est activé :

```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Vérifier RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

### Étape 5 : Tester la fonction manuellement

```sql
-- Tester la fonction (remplacer les valeurs par des valeurs de test)
SELECT public.create_user_profile(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test@example.com',
  '+221771234567',
  'Test User',
  'peintre',
  'Adresse test'
);
```

Si cette commande fonctionne, la fonction est correcte et le problème vient du cache.

## 🔄 Si l'erreur persiste

### Vérifier la connexion Supabase

1. **Vérifier les variables d'environnement** dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL` : Doit être `https://mtborwdznqasahyageej.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Doit être la clé anon correcte

2. **Vérifier que vous utilisez le bon projet Supabase**

### Alternative : Utiliser une fonction avec paramètres nommés

Si le problème persiste, on peut modifier le code pour appeler la fonction différemment, mais d'abord essayons de résoudre le cache.

## 📋 Checklist

- [ ] Fonction créée dans Supabase SQL Editor
- [ ] Fonction vérifiée avec `SELECT` (voir Étape 1)
- [ ] Cache Supabase vidé ou attendu 2-3 minutes
- [ ] Permissions vérifiées (GRANT EXECUTE)
- [ ] Test manuel de la fonction réussi
- [ ] Variables d'environnement Vercel correctes

## 🎯 Résultat attendu

Après toutes ces étapes :
- ✅ La fonction existe dans Supabase
- ✅ Le cache est rafraîchi
- ✅ La création de compte fonctionne
- ✅ Plus d'erreur "Could not find the function"

