# 🔧 Solution complète : Correction des 3 erreurs

## ❌ Erreurs à corriger

1. **Erreur de type MIME** : `image/png, image/jpeg, image/jpg, image/gif, image/webp`
2. **Erreur RLS** : `new row violates row-level security policy`
3. **Erreur de session** : `Votre session n'est pas valide` lors de la création d'un devis

## ✅ Solutions

### 1. Correction de l'erreur de type MIME

#### Problème
Le bucket `logos` a des restrictions de types MIME qui ne correspondent pas au type envoyé.

#### Solution

**Option A : Modifier la configuration du bucket (Recommandé)**

1. Aller dans **Supabase Dashboard → Storage → logos**
2. Cliquer sur **Settings** (⚙️)
3. Dans **"Allowed MIME types"**, ajouter ou vérifier :
   ```
   image/png,image/jpeg,image/jpg,image/gif,image/webp
   ```
4. Sauvegarder

**Option B : Supprimer les restrictions**

1. Aller dans **Storage → logos → Settings**
2. **Supprimer tous les types MIME** de la liste
3. Sauvegarder (autorise tous les types)

**Le code a été amélioré pour :**
- ✅ Forcer le type MIME `image/png` lors de la création du blob
- ✅ Vérifier que le blob a le bon type avant l'upload
- ✅ Afficher des messages d'erreur clairs

### 2. Correction de l'erreur RLS pour quotes

#### Problème
Les politiques RLS pour la table `quotes` ne sont pas correctement configurées ou la session n'est pas transmise.

#### Solution

**Étape 1 : Exécuter le script SQL**

1. Aller dans **Supabase Dashboard → SQL Editor**
2. Ouvrir le fichier `lib/supabase/FIX_QUOTES_RLS_DEFINITIVE.sql`
3. Copier-coller le contenu dans l'éditeur SQL
4. Exécuter le script

Ce script :
- ✅ Accorde tous les privilèges nécessaires
- ✅ Supprime toutes les anciennes politiques
- ✅ Recrée les politiques RLS avec des noms uniques
- ✅ Crée la fonction `generate_quote_number` avec les bonnes permissions
- ✅ Vérifie que tout est correctement configuré

**Étape 2 : Vérifier les résultats**

Le script affiche :
- Les politiques créées pour `quotes` et `quote_items`
- Les privilèges accordés
- Le statut de l'utilisateur authentifié

### 3. Correction de l'erreur de session invalide

#### Problème
La session n'est pas correctement vérifiée ou transmise lors de la création du devis.

#### Solution

**Le code a été amélioré pour :**

1. **Vérifier la session avant chaque opération**
   - Vérification au début de `handleSave`
   - Vérification finale avant l'insertion dans `createQuote`

2. **Utiliser l'ID de la session vérifiée**
   - Utiliser `finalSession.user.id` au lieu de `user.id`
   - Vérifier que les IDs correspondent

3. **Logs détaillés pour le débogage**
   - Afficher l'ID utilisateur avant l'insertion
   - Afficher les détails de l'erreur si elle se produit

4. **Messages d'erreur spécifiques**
   - Erreur RLS : Message clair avec instructions
   - Erreur de session : Message pour se reconnecter
   - Erreur de permission : Message explicite

## 📋 Checklist de vérification

### Pour l'erreur de type MIME
- [ ] Le bucket `logos` existe dans Supabase Storage
- [ ] Le bucket est **PUBLIC**
- [ ] Les types MIME sont configurés ou supprimés
- [ ] Tester l'upload d'une signature

### Pour l'erreur RLS
- [ ] Le script `FIX_QUOTES_RLS_DEFINITIVE.sql` a été exécuté
- [ ] Les politiques sont créées (vérifier dans les résultats du script)
- [ ] Les privilèges sont accordés (vérifier dans les résultats du script)
- [ ] La fonction `generate_quote_number` existe

### Pour l'erreur de session
- [ ] Se déconnecter et se reconnecter
- [ ] Vérifier que les cookies sont présents (F12 → Application → Cookies)
- [ ] Tester la création d'un devis
- [ ] Vérifier les logs dans la console (F12)

## 🧪 Test complet

1. **Se connecter à l'application**
2. **Aller dans Profil → Ajouter une signature**
   - Signer dans le cadre
   - Enregistrer
   - ✅ Vérifier qu'il n'y a pas d'erreur de type MIME

3. **Aller dans Devis → Nouveau devis**
   - Sélectionner un client
   - Ajouter des articles
   - Créer le devis
   - ✅ Vérifier qu'il n'y a pas d'erreur RLS ou de session

## 🔍 Dépannage

### L'erreur de type MIME persiste

1. Vérifier que le bucket est bien **PUBLIC**
2. Vérifier que les types MIME sont bien configurés
3. Essayer de supprimer toutes les restrictions
4. Vérifier les logs dans la console (F12)

### L'erreur RLS persiste

1. Vérifier que le script SQL a été exécuté sans erreur
2. Vérifier que les politiques existent :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'quotes';
   ```
3. Vérifier que `auth.uid()` retourne une valeur :
   ```sql
   SELECT auth.uid() as current_user_id;
   ```
4. Se déconnecter et se reconnecter

### L'erreur de session persiste

1. Vérifier les cookies (F12 → Application → Cookies)
   - Doit y avoir `sb-<project>-auth-token`
2. Vérifier la session dans la console :
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```
3. Se déconnecter et se reconnecter
4. Vider le cache du navigateur

## 📝 Notes importantes

- Les scripts SQL doivent être exécutés dans l'ordre
- Après avoir exécuté les scripts, **se déconnecter et se reconnecter** est recommandé
- Les logs dans la console (F12) fournissent des informations détaillées pour le débogage
- Si les erreurs persistent, vérifier les logs Supabase Dashboard → Logs → Postgres

