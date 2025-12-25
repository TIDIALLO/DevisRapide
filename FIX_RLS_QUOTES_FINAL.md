# 🔧 Solution finale : Erreur RLS pour quotes (42501)

## ❌ Erreur

```
code: "42501"
message: "new row violates row-level security policy for table \"quotes\""
```

## ✅ Solution en 3 étapes

### Étape 1 : Exécuter le script SQL (OBLIGATOIRE)

1. **Aller dans Supabase Dashboard → SQL Editor**
2. **Ouvrir le fichier** `lib/supabase/FIX_QUOTES_RLS_DEFINITIVE.sql`
3. **Copier-coller tout le contenu** dans l'éditeur SQL
4. **Exécuter le script** (bouton "Run" ou F5)
5. **Vérifier les résultats** :
   - Doit afficher 4 politiques pour `quotes`
   - Doit afficher 4 politiques pour `quote_items`
   - Doit afficher que la fonction `generate_quote_number` existe

### Étape 2 : Vérifier que les politiques existent

Exécuter cette requête dans SQL Editor pour vérifier :

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
- `quotes_select_own` (SELECT)
- `quotes_insert_own` (INSERT) ← **CRUCIAL**
- `quotes_update_own` (UPDATE)
- `quotes_delete_own` (DELETE)
- `quote_items_select_own` (SELECT)
- `quote_items_insert_own` (INSERT)
- `quote_items_update_own` (UPDATE)
- `quote_items_delete_own` (DELETE)

### Étape 3 : Se déconnecter et se reconnecter

**IMPORTANT** : Après avoir exécuté le script SQL, vous DEVEZ :

1. **Se déconnecter** de l'application
2. **Se reconnecter** (cela rafraîchit les cookies de session)
3. **Tester la création d'un devis**

## 🔍 Vérification de la session

Si l'erreur persiste, vérifier que la session est correctement transmise :

1. **Ouvrir la console** (F12)
2. **Exécuter cette commande** :

```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('Session valide:', !!user);
```

3. **Vérifier les cookies** :
   - F12 → Application → Cookies
   - Doit y avoir `sb-<project>-auth-token`

## 🐛 Dépannage

### L'erreur persiste après avoir exécuté le script

1. **Vérifier que le script a été exécuté sans erreur**
   - Regarder les messages dans SQL Editor
   - S'assurer qu'il n'y a pas d'erreur rouge

2. **Vérifier que les politiques existent** (voir Étape 2)

3. **Vérifier les privilèges** :

```sql
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('quotes', 'quote_items')
  AND grantee IN ('anon', 'authenticated', 'service_role');
```

4. **Vérifier auth.uid()** :

```sql
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;
```

Si `auth.uid()` retourne `NULL`, cela signifie que la session n'est pas transmise.

### La session semble valide mais l'erreur persiste

1. **Vider le cache du navigateur**
2. **Fermer et rouvrir le navigateur**
3. **Se déconnecter et se reconnecter**
4. **Vérifier que les cookies sont bien présents**

## 📋 Checklist complète

- [ ] Script SQL `FIX_QUOTES_RLS_DEFINITIVE.sql` exécuté
- [ ] 8 politiques créées (4 pour quotes, 4 pour quote_items)
- [ ] Fonction `generate_quote_number` créée
- [ ] Privilèges accordés aux rôles
- [ ] Déconnexion/reconnexion effectuée
- [ ] Cookies présents dans le navigateur
- [ ] Session valide vérifiée dans la console

## ✅ Code amélioré

Le code a été amélioré pour :
- ✅ Utiliser `getUser()` qui force un refresh de la session
- ✅ Vérifier la session avec `getSession()` également
- ✅ Vérifier que les IDs correspondent entre `getUser()`, `getSession()` et `user`
- ✅ Afficher des logs détaillés pour le débogage

## 🎯 Résultat attendu

Après avoir suivi ces étapes :
- ✅ La création de devis devrait fonctionner
- ✅ Aucune erreur RLS ne devrait apparaître
- ✅ Les logs dans la console devraient montrer "✅ Session confirmée"

