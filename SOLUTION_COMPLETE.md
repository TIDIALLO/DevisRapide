# 🔧 Solution complète : Erreur create_user_profile

## ❌ Erreur

```
Could not find the function public.create_user_profile(p_address, p_email, p_full_name, p_phone, p_profession, p_user_id) in the schema cache
```

## 🔍 Cause

Le problème vient du **cache PostgREST** de Supabase qui n'a pas été rafraîchi après la création de la fonction.

## ✅ Solution en 3 étapes

### Étape 1 : Exécuter le script SQL complet

1. **Ouvrir Supabase SQL Editor** :
   - https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql/new

2. **Copier-coller** le contenu de :
   - `lib/supabase/FIX_WITH_CACHE_REFRESH.sql`

3. **Exécuter** le script (Run ou Ctrl+Enter)

4. **Vérifier les résultats** :
   - Vous devriez voir un message "✅ Ordre correct"
   - La fonction doit apparaître avec les bons paramètres

### Étape 2 : Attendre le rafraîchissement du cache

**IMPORTANT** : Attendre **30 secondes à 2 minutes** après l'exécution du script pour que le cache se rafraîchisse.

### Étape 3 : Tester la création de compte

1. **Retourner sur votre application**
2. **Essayer de créer un compte**
3. L'erreur devrait être résolue

## 🔄 Si l'erreur persiste après 2 minutes

### Option A : Vérifier manuellement que la fonction existe

Dans Supabase SQL Editor, exécuter :

```sql
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  proargnames as parameter_names
FROM pg_proc
WHERE proname = 'create_user_profile'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

**Résultat attendu** :
- `function_name`: `create_user_profile`
- `arguments`: `UUID, TEXT, TEXT, TEXT, TEXT, TEXT`
- `parameter_names`: `{p_user_id,p_email,p_phone,p_full_name,p_profession,p_address}`

### Option B : Forcer le rafraîchissement manuellement

Dans Supabase SQL Editor, exécuter :

```sql
-- Forcer le rafraîchissement du cache
NOTIFY pgrst, 'reload schema';
```

Puis attendre 1-2 minutes.

### Option C : Vérifier les variables d'environnement Vercel

1. **Aller sur Vercel** : https://vercel.com/tidiallos-projects/devisrapide/settings/environment-variables

2. **Vérifier** :
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://mtborwdznqasahyageej.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Votre clé anon correcte

3. **Redéployer** si les variables ont changé

## 📋 Checklist de vérification

- [ ] Script SQL exécuté dans Supabase
- [ ] Message "✅ Ordre correct" visible dans les résultats
- [ ] Attendu 30 secondes à 2 minutes après l'exécution
- [ ] Fonction vérifiée avec `SELECT` (voir Option A)
- [ ] Variables d'environnement Vercel correctes
- [ ] Test de création de compte effectué

## 🎯 Résultat attendu

Après toutes ces étapes :
- ✅ La fonction existe dans Supabase
- ✅ Le cache est rafraîchi
- ✅ La création de compte fonctionne
- ✅ Plus d'erreur "Could not find the function"

## ⚠️ Note importante

**Le cache Supabase peut prendre jusqu'à 2 minutes pour se rafraîchir**. Si vous testez immédiatement après avoir créé la fonction, l'erreur peut encore apparaître. **Attendez 1-2 minutes** avant de tester.

