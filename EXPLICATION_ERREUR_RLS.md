# 🔒 Explication de l'erreur RLS : "new row violates row-level security policy"

## ❌ Le problème

L'erreur `new row violates row-level security policy for table "clients"` se produit lors de la création d'un client.

## 🔍 Pourquoi cette erreur ?

### Row Level Security (RLS) dans Supabase

RLS est un système de sécurité qui contrôle l'accès aux lignes d'une table en fonction de l'utilisateur authentifié. Pour la table `clients`, la politique dit :

```sql
CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

Cette politique vérifie que :
- `auth.uid()` = l'ID de l'utilisateur actuellement authentifié
- `user_id` = l'ID de l'utilisateur dans la ligne à insérer
- Les deux doivent être **identiques**

### Causes possibles de l'erreur

1. **Session expirée ou invalide**
   - `auth.uid()` retourne `NULL` car l'utilisateur n'est plus authentifié
   - La condition `NULL = user_id` échoue

2. **user_id ne correspond pas à auth.uid()**
   - Le code insère un `user_id` différent de l'utilisateur authentifié
   - Par exemple : `user_id: 'autre-id'` alors que `auth.uid() = 'mon-id'`

3. **Politiques RLS mal configurées**
   - Les politiques n'existent pas ou sont mal créées
   - Les politiques ont été supprimées par erreur

4. **Problème de timing**
   - La session n'est pas encore établie au moment de l'insertion
   - Le client Supabase n'a pas encore récupéré la session

## ✅ Solutions

### Solution 1 : Exécuter le script SQL de correction

1. Aller dans **Supabase Dashboard** → **SQL Editor**
2. Exécuter le fichier `lib/supabase/FIX_RLS_CLIENTS.sql`
3. Ce script :
   - Supprime les anciennes politiques
   - Recrée les politiques correctement
   - Vérifie que tout est en place

### Solution 2 : Vérifier la session avant l'insertion

Le code a été amélioré pour :
- Vérifier que l'utilisateur est bien authentifié
- S'assurer que `user_id` correspond à `auth.uid()`
- Afficher des messages d'erreur plus clairs

### Solution 3 : Vérifier manuellement dans Supabase

1. Aller dans **Supabase Dashboard** → **Authentication** → **Policies**
2. Vérifier que la table `clients` a bien 4 politiques :
   - `Users can read own clients` (SELECT)
   - `Users can create own clients` (INSERT)
   - `Users can update own clients` (UPDATE)
   - `Users can delete own clients` (DELETE)

3. Vérifier que la politique INSERT contient :
   ```sql
   WITH CHECK (auth.uid() = user_id)
   ```

## 🧪 Test de diagnostic

Pour vérifier si le problème vient de la session :

```typescript
// Dans la console du navigateur ou dans le code
const { data: { user }, error } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('Session:', await supabase.auth.getSession());
```

Si `user` est `null` ou si la session est `null`, c'est un problème d'authentification.

## 📋 Checklist de résolution

- [ ] Exécuter le script `FIX_RLS_CLIENTS.sql` dans Supabase
- [ ] Vérifier que l'utilisateur est bien connecté
- [ ] Vérifier que `user_id` correspond à `auth.uid()`
- [ ] Vérifier les politiques RLS dans Supabase Dashboard
- [ ] Tester la création d'un client après correction

## 🎯 Résultat attendu

Après correction :
- ✅ La création de client fonctionne sans erreur RLS
- ✅ Seuls les clients de l'utilisateur authentifié sont créés
- ✅ Les messages d'erreur sont plus clairs si un problème persiste

