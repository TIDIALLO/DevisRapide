# 🔧 Correction : Erreur de type MIME pour les signatures

## ❌ Problème

Erreur lors de l'upload de la signature : le type MIME `image/png` n'est pas autorisé par le bucket.

## ✅ Solution

### Option 1 : Vérifier et corriger la configuration du bucket (Recommandé)

1. **Aller dans Supabase Dashboard**
   - Ouvrir votre projet Supabase
   - Aller dans **Storage** → **logos** (ou créer le bucket si nécessaire)

2. **Vérifier/Modifier les paramètres du bucket**
   - Cliquer sur **Settings** (⚙️) du bucket "logos"
   - Vérifier la section **"Allowed MIME types"** ou **"File restrictions"**
   - S'assurer que les types suivants sont autorisés :
     - ✅ `image/png`
     - ✅ `image/jpeg`
     - ✅ `image/jpg`
     - ✅ `image/gif`
     - ✅ `image/webp`

3. **Si les types MIME ne sont pas configurés**
   - Cliquer sur **"Edit"** ou **"Update bucket"**
   - Dans **"Allowed MIME types"**, ajouter :
     ```
     image/png,image/jpeg,image/jpg,image/gif,image/webp
     ```
   - Ou laisser vide pour autoriser tous les types
   - Sauvegarder

### Option 2 : Supprimer les restrictions de type MIME

Si vous ne voulez pas de restrictions :

1. **Aller dans Storage → logos → Settings**
2. **Supprimer tous les types MIME** de la liste "Allowed MIME types"
3. **Sauvegarder**

Cela permettra d'uploader n'importe quel type de fichier (moins sécurisé mais plus flexible).

### Option 3 : Vérifier les politiques RLS

Si l'erreur persiste, vérifier les politiques RLS :

1. **Aller dans Storage → logos → Policies**
2. **Vérifier qu'il y a une politique INSERT** pour les utilisateurs authentifiés
3. **Si nécessaire, exécuter le script SQL** :
   - Aller dans **SQL Editor**
   - Exécuter `lib/supabase/CREATE_STORAGE_BUCKETS.sql`

## 🔍 Vérification

Après avoir modifié la configuration :

1. **Recharger la page Profil** dans l'application
2. **Essayer d'ajouter une signature**
3. **Vérifier qu'il n'y a plus d'erreur**

## 📋 Types MIME courants pour les images

- `image/png` - PNG (recommandé pour les signatures)
- `image/jpeg` ou `image/jpg` - JPEG
- `image/gif` - GIF
- `image/webp` - WebP
- `image/svg+xml` - SVG (si nécessaire)

## ⚠️ Notes importantes

- Le code a été amélioré pour **forcer le type MIME `image/png`** lors de l'upload
- Les messages d'erreur sont maintenant **plus clairs** et indiquent exactement le problème
- Si le problème persiste, vérifier les **logs de la console** (F12) pour plus de détails

## 🐛 Dépannage

### L'erreur persiste après avoir configuré les types MIME

1. **Vérifier que le bucket est PUBLIC**
   - Storage → logos → Settings
   - "Public bucket" doit être activé

2. **Vérifier les permissions**
   - Storage → logos → Policies
   - Doit y avoir une politique INSERT pour `authenticated`

3. **Vérifier les logs**
   - Ouvrir la console (F12)
   - Regarder les erreurs détaillées
   - Copier le message d'erreur complet

### Le type MIME est correct mais l'upload échoue toujours

1. **Vérifier la taille du fichier**
   - Les signatures ne devraient pas dépasser quelques KB
   - Si le fichier est trop gros, vérifier la limite du bucket (par défaut 5 MB)

2. **Vérifier la connexion**
   - S'assurer que la connexion Internet est stable
   - Réessayer après quelques secondes

