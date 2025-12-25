# 🔧 Guide de dépannage RLS - Erreur de session

## ❌ Erreur rencontrée

```
❌ Erreur: 🔒 Erreur de sécurité : Votre session a peut-être expiré. Veuillez vous reconnecter.
```

## 🔍 Diagnostic

Cette erreur indique que la session Supabase n'est pas correctement récupérée ou que `auth.uid()` ne correspond pas au `user_id` inséré.

### Étapes de diagnostic

1. **Ouvrir la console du navigateur** (F12)
2. **Exécuter ces commandes** dans la console :

```javascript
// Vérifier la session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);

// Vérifier l'utilisateur
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
console.log('User ID:', user?.id);
```

### Résultats attendus

- ✅ **Session valide** : `session` et `user` ne sont pas `null`
- ❌ **Session invalide** : `session` ou `user` est `null` → Il faut se reconnecter

## ✅ Solutions

### Solution 1 : Exécuter le script SQL de correction

1. Aller dans **Supabase Dashboard** → **SQL Editor**
2. Exécuter le fichier `lib/supabase/FIX_RLS_CLIENTS.sql`
3. Vérifier que les 4 politiques sont créées :
   - `Users can read own clients`
   - `Users can create own clients`
   - `Users can update own clients`
   - `Users can delete own clients`

### Solution 2 : Vérifier la session dans le code

Le code a été amélioré pour :
- Vérifier la session avec `getSession()` avant l'insertion
- Tester les permissions RLS avec une requête SELECT
- Afficher des messages d'erreur plus détaillés

### Solution 3 : Se reconnecter

Si la session est expirée :

1. Se déconnecter
2. Se reconnecter
3. Réessayer de créer un client

### Solution 4 : Vérifier les cookies

Les cookies de session Supabase doivent être présents :

1. Ouvrir les **Outils de développement** (F12)
2. Aller dans **Application** → **Cookies**
3. Vérifier la présence de cookies commençant par `sb-` :
   - `sb-<project-ref>-auth-token`
   - `sb-<project-ref>-auth-token-code-verifier`

Si ces cookies n'existent pas, la session n'est pas stockée correctement.

### Solution 5 : Vérifier la configuration Supabase

1. Aller dans **Supabase Dashboard** → **Authentication** → **Policies**
2. Vérifier que la table `clients` a bien les politiques RLS
3. Vérifier que la politique INSERT contient :
   ```sql
   WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id)
   ```

## 🧪 Test de création de client

Après avoir appliqué les corrections :

1. Se reconnecter si nécessaire
2. Aller sur la page **Clients**
3. Cliquer sur **Nouveau client**
4. Remplir le formulaire :
   - Nom complet : `Test Client`
   - Téléphone : `+221 77 123 45 67`
5. Cliquer sur **Enregistrer**

### Résultat attendu

- ✅ Le client est créé sans erreur
- ✅ Le client apparaît dans la liste
- ❌ Si erreur, vérifier les logs dans la console

## 📋 Checklist de résolution

- [ ] Script SQL `FIX_RLS_CLIENTS.sql` exécuté dans Supabase
- [ ] Session vérifiée dans la console (non null)
- [ ] Cookies de session présents dans le navigateur
- [ ] Politiques RLS vérifiées dans Supabase Dashboard
- [ ] Test de création de client effectué
- [ ] Logs de la console vérifiés en cas d'erreur

## 🔄 Si le problème persiste

1. **Vider le cache du navigateur** et les cookies
2. **Se déconnecter et se reconnecter**
3. **Vérifier les logs Supabase** :
   - Dashboard → Logs → Postgres Logs
   - Chercher les erreurs liées à `clients` et `RLS`
4. **Contacter le support** avec :
   - Les logs de la console
   - Les logs Supabase
   - La date/heure de l'erreur

