# 🚨 URGENT : Correction de l'erreur RLS pour quotes

## ❌ Erreur actuelle

```
code: "42501"
message: "new row violates row-level security policy for table \"quotes\""
```

## ✅ Solution IMMÉDIATE (3 étapes obligatoires)

### ÉTAPE 1 : Exécuter le script SQL (OBLIGATOIRE)

**⚠️ CETTE ÉTAPE EST CRUCIALE - SANS ELLE, RIEN NE FONCTIONNERA**

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet

2. **Aller dans SQL Editor**
   - Menu de gauche → **SQL Editor**

3. **Créer une nouvelle requête**
   - Cliquer sur **"New query"**

4. **Ouvrir le fichier** `lib/supabase/FIX_QUOTES_RLS_DEFINITIVE.sql`
   - Copier **TOUT le contenu** du fichier
   - Coller dans l'éditeur SQL

5. **Exécuter le script**
   - Cliquer sur **"Run"** ou appuyer sur **F5**
   - ⚠️ **ATTENDRE** que le script se termine complètement
   - Vérifier qu'il n'y a **AUCUNE erreur rouge**

6. **Vérifier les résultats**
   - Le script doit afficher :
     - ✅ 8 politiques créées (4 pour quotes, 4 pour quote_items)
     - ✅ Privilèges accordés
     - ✅ Fonction generate_quote_number créée

### ÉTAPE 2 : Vérifier que les politiques existent

**Exécuter cette requête dans SQL Editor :**

```sql
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('quotes', 'quote_items')
ORDER BY tablename, policyname;
```

**Résultat attendu :**
- ✅ `quotes_select_own` (SELECT)
- ✅ `quotes_insert_own` (INSERT) ← **LE PLUS IMPORTANT**
- ✅ `quotes_update_own` (UPDATE)
- ✅ `quotes_delete_own` (DELETE)
- ✅ `quote_items_select_own` (SELECT)
- ✅ `quote_items_insert_own` (INSERT)
- ✅ `quote_items_update_own` (UPDATE)
- ✅ `quote_items_delete_own` (DELETE)

**Si vous ne voyez pas ces 8 politiques, le script n'a pas été exécuté correctement.**

### ÉTAPE 3 : Se déconnecter et se reconnecter

**⚠️ OBLIGATOIRE après avoir exécuté le script SQL**

1. **Dans l'application** :
   - Cliquer sur votre profil
   - Se déconnecter

2. **Se reconnecter** :
   - Entrer votre email et mot de passe
   - Cliquer sur "Se connecter"

3. **Tester la création d'un devis** :
   - Aller dans "Devis" → "Nouveau devis"
   - Sélectionner un client
   - Ajouter des articles
   - Cliquer sur "Créer et envoyer"

## 🔍 Diagnostic si l'erreur persiste

### Vérifier les politiques RLS

Exécuter le script `lib/supabase/VERIFY_RLS_QUOTES.sql` dans SQL Editor pour un diagnostic complet.

### Vérifier la session dans la console

1. **Ouvrir la console** (F12)
2. **Exécuter cette commande** :

```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('Session valide:', !!user);
```

**Résultat attendu :**
- ✅ `User ID:` doit afficher un UUID (ex: `f4caa0ca-d39a-4240-9c47-13a9be6f0efd`)
- ✅ `Session valide:` doit afficher `true`

**Si `User ID:` est `null` ou `undefined`, la session n'est pas valide.**

### Vérifier les cookies

1. **F12 → Application → Cookies**
2. **Vérifier la présence de** :
   - `sb-<project-id>-auth-token`
   - `sb-<project-id>-auth-token-code-verifier`

**Si ces cookies n'existent pas, se déconnecter et se reconnecter.**

## 📋 Checklist complète

- [ ] Script SQL `FIX_QUOTES_RLS_DEFINITIVE.sql` exécuté
- [ ] Aucune erreur lors de l'exécution du script
- [ ] 8 politiques vérifiées avec la requête SELECT
- [ ] Déconnexion effectuée
- [ ] Reconnexion effectuée
- [ ] Cookies présents dans le navigateur
- [ ] Session valide vérifiée dans la console
- [ ] Test de création de devis effectué

## ⚠️ Points importants

1. **Le script SQL DOIT être exécuté** - Sans lui, les politiques RLS n'existent pas
2. **La déconnexion/reconnexion est OBLIGATOIRE** - Pour rafraîchir les cookies
3. **Les cookies doivent être présents** - Sinon la session n'est pas transmise
4. **La session doit être valide** - Vérifier avec `getUser()` dans la console

## 🆘 Si rien ne fonctionne

1. **Vérifier que vous êtes bien connecté** dans Supabase Dashboard
2. **Vérifier que vous avez les droits** pour exécuter des scripts SQL
3. **Vérifier les logs Supabase** :
   - Dashboard → Logs → Postgres
   - Chercher les erreurs liées à RLS

4. **Contacter le support** avec :
   - Les résultats de `VERIFY_RLS_QUOTES.sql`
   - Les logs de la console (F12)
   - Le message d'erreur complet

