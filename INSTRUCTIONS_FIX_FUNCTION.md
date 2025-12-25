# 🔧 Instructions pour corriger l'erreur `create_user_profile`

## ❌ Erreur actuelle

```
Could not find the function public.create_user_profile(p_address, p_email, p_full_name, p_phone, p_profession, p_user_id) in the schema cache
```

## ✅ Solution

La fonction `create_user_profile` n'existe pas dans votre base de données Supabase ou a une signature incorrecte.

### Étape 1 : Ouvrir Supabase SQL Editor

1. **Aller sur** : https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql/new
2. Ou dans votre projet Supabase : **SQL Editor** > **New Query**

### Étape 2 : Exécuter le script SQL

1. **Copier tout le contenu** du fichier :
   - `lib/supabase/FIX_ALL_FUNCTIONS.sql` (contient les 2 fonctions nécessaires)

2. **Coller dans l'éditeur SQL** de Supabase

3. **Cliquer sur "Run"** (ou `Ctrl+Enter`)

### Étape 3 : Vérifier que les fonctions sont créées

Après l'exécution, vous devriez voir un résultat qui affiche **2 fonctions** :
- `create_user_profile` : Pour créer le profil utilisateur
- `import_catalog_items` : Pour importer les templates de catalogue

Chaque fonction doit afficher :
- `function_name`: Le nom de la fonction
- `arguments`: Les paramètres de la fonction

### Étape 4 : Tester la création de compte

1. **Retourner sur votre application** déployée
2. **Essayer de créer un compte**
3. L'erreur devrait être résolue

## 📋 Détails techniques

### Signature de la fonction

La fonction est créée avec cette signature exacte :
```sql
create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_phone TEXT,
  p_full_name TEXT,
  p_profession TEXT,
  p_address TEXT DEFAULT NULL
)
```

### Ce que fait la fonction

1. **Insère** un nouveau profil utilisateur dans la table `users`
2. **Met à jour** le profil si l'utilisateur existe déjà (ON CONFLICT)
3. **Contourne RLS** grâce à `SECURITY DEFINER`
4. **Définit le plan** par défaut à `'free'`

### Permissions

- ✅ `authenticated` : Peut exécuter la fonction
- ✅ `anon` : Peut exécuter la fonction (nécessaire pour l'inscription)

## ⚠️ Si l'erreur persiste

1. **Vérifier que la table `users` existe** :
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'users';
   ```

2. **Vérifier que la fonction existe** :
   ```sql
   SELECT proname, pg_get_function_arguments(oid) 
   FROM pg_proc 
   WHERE proname = 'create_user_profile';
   ```

3. **Vider le cache Supabase** :
   - Dans Supabase Dashboard : **Settings** > **API** > **Clear cache** (si disponible)
   - Ou attendre quelques minutes pour que le cache se rafraîchisse

## 🎯 Résultat attendu

Après avoir exécuté le script SQL :
- ✅ La fonction `create_user_profile` existe dans Supabase
- ✅ La création de compte fonctionne sans erreur
- ✅ Le profil utilisateur est créé correctement

