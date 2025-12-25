# 📝 Instructions : Configuration du bucket pour les signatures

## ❌ Problème

L'erreur "Bucket not found" se produit car le bucket `logos` n'existe pas dans Supabase Storage.

## ✅ Solution

### Étape 1 : Créer le bucket dans Supabase Dashboard

1. **Aller dans Supabase Dashboard**
   - Ouvrir votre projet Supabase
   - Aller dans l'onglet **Storage** (dans le menu de gauche)

2. **Créer un nouveau bucket**
   - Cliquer sur **"New bucket"** ou **"Create bucket"**
   - Remplir les informations :
     - **Name**: `logos`
     - **Public**: ✅ **Oui** (important pour que les images soient accessibles)
     - **File size limit**: `5242880` (5 MB)
     - **Allowed MIME types**: 
       - `image/png`
       - `image/jpeg`
       - `image/jpg`
       - `image/gif`
       - `image/webp`

3. **Créer le bucket**

### Étape 2 : Configurer les politiques RLS (Optionnel mais recommandé)

1. **Aller dans SQL Editor**
   - Dans Supabase Dashboard, aller dans **SQL Editor**

2. **Exécuter le script**
   - Ouvrir le fichier `lib/supabase/CREATE_STORAGE_BUCKETS.sql`
   - Copier-coller le contenu dans l'éditeur SQL
   - Exécuter le script

   Ce script crée les politiques RLS pour permettre :
   - ✅ Les utilisateurs authentifiés peuvent uploader leurs logos/signatures
   - ✅ Tout le monde peut lire les logos (public)
   - ✅ Seul le propriétaire peut modifier/supprimer ses fichiers

### Étape 3 : Tester

1. **Aller sur la page Profil**
   - Se connecter à l'application
   - Aller dans **Profil**

2. **Ajouter une signature**
   - Cliquer sur **"Ajouter une signature"**
   - Signer dans le cadre
   - Cliquer sur **"Enregistrer"**

3. **Vérifier**
   - La signature devrait s'afficher dans le profil
   - Aucune erreur "Bucket not found" ne devrait apparaître

## 🎨 Améliorations apportées

### 1. Gestion d'erreur améliorée
- ✅ Message d'erreur clair si le bucket n'existe pas
- ✅ Tentative automatique de création du bucket (si permissions suffisantes)
- ✅ Messages de succès/erreur élégants avec notifications visuelles

### 2. Expérience utilisateur améliorée
- ✅ Indicateur de chargement pendant l'enregistrement
- ✅ Canvas haute résolution pour un rendu net
- ✅ Dessin fluide et naturel
- ✅ Support tactile amélioré (mobile)
- ✅ Interface moderne et professionnelle

### 3. Performance
- ✅ Canvas optimisé avec `willReadFrequently`
- ✅ Image smoothing de haute qualité
- ✅ Prévention du scroll sur mobile

## 🔧 Dépannage

### Le bucket existe mais l'erreur persiste

1. **Vérifier que le bucket est public**
   - Dans Storage → logos → Settings
   - S'assurer que "Public bucket" est activé

2. **Vérifier les politiques RLS**
   - Dans Storage → logos → Policies
   - Vérifier que les politiques sont créées

### L'upload fonctionne mais l'image ne s'affiche pas

1. **Vérifier l'URL publique**
   - L'URL devrait commencer par `https://[project].supabase.co/storage/v1/object/public/logos/...`

2. **Vérifier les permissions CORS**
   - Dans Supabase Dashboard → Settings → API
   - Vérifier les paramètres CORS

## 📋 Notes importantes

- Le bucket doit être **PUBLIC** pour que les signatures soient accessibles dans les PDFs
- Les fichiers sont nommés avec le format : `signature-{user_id}-{timestamp}.png`
- Les anciennes signatures ne sont pas automatiquement supprimées (à nettoyer manuellement si nécessaire)

