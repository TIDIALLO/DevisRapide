# 📦 Création du bucket "logos" dans Supabase

## ✅ Solution automatique

Le code tente maintenant de créer automatiquement le bucket "logos" s'il n'existe pas. Si vous avez les permissions nécessaires, cela devrait fonctionner automatiquement.

## 🔧 Solution manuelle (si la création automatique échoue)

Si vous recevez une erreur indiquant que le bucket n'existe pas, suivez ces étapes :

### Étape 1 : Créer le bucket dans Supabase Dashboard

1. **Ouvrir Supabase Dashboard**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet

2. **Aller dans Storage**
   - Cliquez sur **Storage** dans le menu de gauche (icône 📦)

3. **Créer un nouveau bucket**
   - Cliquez sur **"New bucket"** ou **"Create bucket"**
   - Remplissez les informations suivantes :
     - **Name** : `logos` (exactement, en minuscules)
     - **Public bucket** : ✅ **Oui** (très important !)
     - **File size limit** : `5242880` (5 MB) ou laissez vide
     - **Allowed MIME types** : 
       ```
       image/png,image/jpeg,image/jpg,image/gif,image/webp
       ```
       Ou laissez vide pour autoriser tous les types d'images

4. **Créer le bucket**
   - Cliquez sur **"Create bucket"** ou **"Save"**

### Étape 2 : Configurer les politiques RLS (Recommandé)

1. **Aller dans SQL Editor**
   - Dans Supabase Dashboard, cliquez sur **SQL Editor** (icône 🗂️)

2. **Exécuter le script**
   - Ouvrez le fichier `lib/supabase/CREATE_STORAGE_BUCKETS.sql`
   - Copiez-collez le contenu dans l'éditeur SQL
   - Cliquez sur **Run** (▶️)

   Ce script crée les politiques RLS pour permettre :
   - ✅ Les utilisateurs authentifiés peuvent uploader leurs logos/signatures
   - ✅ Tout le monde peut lire les logos (public)
   - ✅ Seul le propriétaire peut modifier/supprimer ses fichiers

### Étape 3 : Vérifier

1. **Recharger la page Profil** dans l'application
2. **Essayer d'uploader un logo ou une signature**
3. **Vérifier qu'il n'y a plus d'erreur**

## 🎯 Paramètres recommandés du bucket

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `logos` |
| **Public** | ✅ Oui |
| **File size limit** | 5 MB (5242880 bytes) |
| **Allowed MIME types** | `image/png,image/jpeg,image/jpg,image/gif,image/webp` |

## ⚠️ Notes importantes

1. **Le bucket doit être PUBLIC** : Sinon, les images ne seront pas accessibles publiquement et ne s'afficheront pas dans les PDFs.

2. **Les types MIME** : Si vous laissez vide, tous les types seront autorisés (moins sécurisé mais plus flexible).

3. **Les politiques RLS** : Elles sont importantes pour la sécurité, mais le bucket peut fonctionner sans elles si vous le configurez correctement.

## 🐛 Dépannage

### Erreur : "Bucket not found"
- Vérifiez que le bucket s'appelle exactement `logos` (minuscules)
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur : "MIME type not allowed"
- Vérifiez que `image/png` est dans la liste des types MIME autorisés
- Ou supprimez tous les types MIME pour autoriser tous les types

### Erreur : "Permission denied"
- Vérifiez que les politiques RLS sont correctement configurées
- Exécutez le script `CREATE_STORAGE_BUCKETS.sql`

### Les images ne s'affichent pas dans les PDFs
- Vérifiez que le bucket est **PUBLIC**
- Vérifiez que l'URL du logo/signature dans la base de données commence par `https://`
- Testez l'URL directement dans un navigateur

## 📝 Vérification rapide

Pour vérifier que le bucket est correctement configuré :

```sql
-- Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE name = 'logos';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%logos%';
```

