# 🔧 Configuration des Variables d'Environnement

## ⚠️ IMPORTANT - À faire MAINTENANT

L'application ne peut pas fonctionner sans les variables d'environnement Supabase.

## 📝 Étapes rapides (5 minutes)

### 1. Créer le fichier .env.local

Dans le dossier `devisrapide`, créez un fichier nommé **exactement** `.env.local`

**Windows (PowerShell)** :
```powershell
cd devisrapide
New-Item -Path ".env.local" -ItemType File
```

**Mac/Linux** :
```bash
cd devisrapide
touch .env.local
```

### 2. Ajouter les variables Supabase

Ouvrez le fichier `.env.local` et collez ceci :

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# ou (selon votre dashboard Supabase)
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 3. Obtenir vos clés Supabase

#### Option A : Vous avez déjà un projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **Settings** (⚙️) dans la barre latérale
4. Cliquez sur **API**
5. Copiez :
   - **Project URL** → Collez après `NEXT_PUBLIC_SUPABASE_URL=`
   - **anon public** key → Collez après `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`)

#### Option B : Vous n'avez pas encore de projet Supabase

**Création rapide (3 minutes)** :

1. Allez sur https://supabase.com
2. Cliquez sur **Start your project**
3. Créez un compte (GitHub recommandé)
4. Cliquez sur **New project**
5. Remplissez :
   - **Name** : `devisrapide`
   - **Database Password** : Générez un mot de passe fort
   - **Region** : Europe (West) - plus proche du Sénégal
   - **Pricing Plan** : Free
6. Cliquez sur **Create new project**
7. Attendez 2-3 minutes ⏳
8. Une fois prêt, suivez les étapes de l'**Option A** ci-dessus

### 4. Exemple de .env.local configuré

Votre fichier devrait ressembler à ceci :

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk5MjgwMCwiZXhwIjoxOTQ4NTY4ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Vérifier la configuration

```bash
# Redémarrez le serveur de développement
# Appuyez sur Ctrl+C pour arrêter le serveur actuel
# Puis relancez :
npm run dev
```

Si tout est correct, vous verrez :
```
✓ Ready in 2s
○ Local:        http://localhost:3000
```

## 🗄️ Configuration de la base de données Supabase

### Une fois les variables configurées, exécutez le schéma SQL :

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône 🗂️)
2. Cliquez sur **New query**
3. Ouvrez le fichier `lib/supabase/schema.sql` de votre projet
4. Copiez TOUT le contenu
5. Collez dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (▶️)
7. Attendez que toutes les requêtes s'exécutent

Vous devriez voir :
```
Success. No rows returned
```

### Créer le bucket Storage pour les logos :

1. Dans Supabase, allez dans **Storage** (icône 📦)
2. Cliquez sur **Create a new bucket**
3. Remplissez :
   - **Name** : `logos`
   - **Public bucket** : ✅ **OUI** (très important !)
4. Cliquez sur **Create bucket**

## ✅ Checklist finale

- [ ] Fichier `.env.local` créé dans le dossier `devisrapide`
- [ ] Variable `NEXT_PUBLIC_SUPABASE_URL` configurée
- [ ] Variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurée
- [ ] Schéma SQL exécuté dans Supabase
- [ ] Bucket `logos` créé et configuré en public
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Application accessible sur http://localhost:3000

## 🐛 En cas de problème

### Erreur : "Your project's URL and Key are required"

**Cause** : Le fichier `.env.local` n'existe pas ou est mal configuré

**Solutions** :
1. Vérifiez que le fichier s'appelle **exactement** `.env.local` (avec le point au début)
2. Vérifiez que les variables commencent par `NEXT_PUBLIC_`
3. Vérifiez qu'il n'y a pas d'espaces autour du `=`
4. Redémarrez le serveur (Ctrl+C puis `npm run dev`)

### Erreur : "Table does not exist"

**Cause** : Le schéma SQL n'a pas été exécuté

**Solution** : Retournez dans Supabase SQL Editor et exécutez `lib/supabase/schema.sql`

### Erreur : "Failed to upload logo"

**Cause** : Le bucket `logos` n'existe pas ou n'est pas public

**Solution** :
1. Allez dans Supabase Storage
2. Vérifiez que le bucket `logos` existe
3. Cliquez sur les paramètres (⚙️) du bucket
4. Assurez-vous que **Public** est activé

## 📞 Besoin d'aide ?

Consultez :
- `DEPLOYMENT.md` - Guide complet de déploiement
- `GUIDE_DEMARRAGE.md` - Guide pour débutants
- Documentation Supabase : https://supabase.com/docs

---

**Une fois configuré, votre application sera pleinement fonctionnelle ! 🚀**


