# 🔧 Solution définitive pour l'erreur RLS 403 (42501)

## ❌ Le problème

L'erreur `new row violates row-level security policy for table "clients"` (code 42501) se produit lors de la création d'un client, même si :
- L'utilisateur est bien authentifié
- Le `user_id` correspond à l'utilisateur connecté
- La session est valide côté client

## 🔍 Cause racine

Le problème vient du fait que `auth.uid()` retourne `NULL` dans la politique RLS côté serveur Supabase, ce qui signifie que **la session n'est pas transmise dans les requêtes HTTP**.

### Pourquoi `auth.uid()` retourne NULL ?

1. **Les cookies de session ne sont pas transmis** dans les requêtes HTTP vers Supabase
2. **Le client Supabase ne gère pas correctement les cookies** avec `createBrowserClient`
3. **Les privilèges ne sont pas accordés** sur la table `clients`

## ✅ Solution complète

### Étape 1 : Exécuter le script SQL complet

1. Aller dans **Supabase Dashboard** → **SQL Editor**
2. Exécuter le fichier `lib/supabase/FIX_RLS_CLIENTS_COMPLETE.sql`
3. Ce script :
   - Accorde les privilèges nécessaires (`GRANT`)
   - Recrée les politiques RLS avec `TO authenticated`
   - Vérifie que tout est en place

### Étape 2 : Simplifier le client Supabase

Le client a été simplifié pour utiliser la **gestion automatique des cookies** de `createBrowserClient`. Ne pas surcharger avec une gestion manuelle qui peut causer des conflits.

### Étape 3 : Vérifier la session après connexion

Le code de connexion vérifie maintenant que la session est bien stockée avant de rediriger.

### Étape 4 : Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

### Étape 5 : Se reconnecter

1. Se déconnecter complètement
2. Vider le cache du navigateur (Ctrl+Shift+Delete)
3. Se reconnecter
4. Vérifier dans la console : "✅ Session stockée - User ID: ..."
5. Réessayer de créer un client

## 🧪 Diagnostic

Si l'erreur persiste, vérifier dans la console du navigateur :

```javascript
// Vérifier la session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);

// Vérifier les cookies
console.log('Cookies:', document.cookie);
```

### Résultats attendus

- ✅ **Session valide** : `session` n'est pas `null` et contient `user.id`
- ✅ **Cookies présents** : `document.cookie` contient `sb-<project>-auth-token`
- ❌ **Si session est null** : La session n'est pas stockée → Se reconnecter
- ❌ **Si cookies absents** : Les cookies ne sont pas définis → Vérifier la connexion

## 📋 Checklist de résolution

- [ ] Script SQL `FIX_RLS_CLIENTS_COMPLETE.sql` exécuté dans Supabase
- [ ] Privilèges accordés sur la table `clients` (vérifier avec le script)
- [ ] Politiques RLS créées avec `TO authenticated` (vérifier avec le script)
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Cache du navigateur vidé
- [ ] Reconnexion effectuée
- [ ] Session vérifiée dans la console ("✅ Session stockée")
- [ ] Test de création de client effectué

## 🎯 Résultat attendu

Après ces corrections :
- ✅ La création de client fonctionne sans erreur RLS
- ✅ `auth.uid()` retourne l'ID de l'utilisateur dans les politiques RLS
- ✅ Les cookies de session sont correctement transmis dans les requêtes HTTP

## 🔄 Si le problème persiste

1. **Vérifier les logs Supabase** :
   - Dashboard → Logs → Postgres Logs
   - Chercher les erreurs liées à `clients` et `RLS`

2. **Tester sans RLS (TEMPORAIRE)** :
   ```sql
   ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
   ```
   - Tester la création d'un client
   - Si ça fonctionne, le problème vient des politiques RLS
   - **Réactiver RLS** : `ALTER TABLE clients ENABLE ROW LEVEL SECURITY;`

3. **Vérifier la configuration Supabase** :
   - Dashboard → Settings → API
   - Vérifier que l'URL et les clés sont correctes

4. **Contacter le support** avec :
   - Les logs de la console
   - Les logs Supabase
   - La date/heure de l'erreur
   - Le résultat du script SQL de diagnostic

