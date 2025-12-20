# Guide de Déploiement - DevisRapide

## 📋 Checklist avant déploiement

- [ ] Compte Supabase créé
- [ ] Base de données configurée
- [ ] Variables d'environnement prêtes
- [ ] Code testé localement
- [ ] Compte Vercel créé

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez :
   - **Name** : devisrapide
   - **Database Password** : (générez un mot de passe fort)
   - **Region** : Europe (West) - le plus proche du Sénégal
   - **Pricing Plan** : Free (suffisant pour MVP)

### 2. Exécuter le schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Copiez tout le contenu du fichier `lib/supabase/schema.sql`
4. Collez et cliquez sur "Run"
5. Vérifiez qu'il n'y a pas d'erreurs

### 3. Configurer le Storage

1. Allez dans **Storage**
2. Cliquez sur "Create a new bucket"
3. Nom : `logos`
4. **Public bucket** : ✅ OUI
5. Cliquez sur "Create bucket"

### 4. Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Notez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : `eyJhbG...` (longue clé)

## 🚀 Déploiement sur Vercel

### Option A : Déploiement via GitHub (Recommandé)

#### 1. Préparer le repository Git

```bash
cd devisrapide
git init
git add .
git commit -m "Initial commit - DevisRapide MVP"
```

#### 2. Pousser sur GitHub

1. Créez un nouveau repository sur [github.com](https://github.com)
2. Nommez-le `devisrapide`
3. **NE PAS** initialiser avec README (vous en avez déjà un)
4. Copiez les commandes et exécutez :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/devisrapide.git
git branch -M main
git push -u origin main
```

#### 3. Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New..." > "Project"
3. Importez votre repository GitHub `devisrapide`
4. Configuration :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)

#### 4. Ajouter les variables d'environnement

Dans Vercel, avant de déployer :

1. Cliquez sur "Environment Variables"
2. Ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...votre-clé-anon
```

3. Sélectionnez : **Production**, **Preview**, **Development**

#### 5. Déployer

1. Cliquez sur "Deploy"
2. Attendez 2-3 minutes
3. Votre app est en ligne ! 🎉

### Option B : Déploiement via CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivez les instructions :
# - Set up and deploy? Yes
# - Which scope? Votre compte
# - Link to existing project? No
# - Project name? devisrapide
# - Directory? ./
# - Override settings? No

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Collez votre URL Supabase

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Collez votre clé anon

# Déployer en production
vercel --prod
```

## 🔧 Configuration post-déploiement

### 1. Configurer le domaine personnalisé (optionnel)

1. Dans Vercel, allez dans **Settings** > **Domains**
2. Ajoutez votre domaine : `devisrapide.sn`
3. Suivez les instructions pour configurer les DNS

### 2. Tester l'application

1. Ouvrez l'URL Vercel : `https://devisrapide.vercel.app`
2. Testez l'inscription
3. Créez un devis test
4. Vérifiez l'upload de logo

### 3. Configurer les redirections Supabase

1. Dans Supabase, allez dans **Authentication** > **URL Configuration**
2. Ajoutez votre URL Vercel dans **Site URL** :
   ```
   https://devisrapide.vercel.app
   ```
3. Ajoutez dans **Redirect URLs** :
   ```
   https://devisrapide.vercel.app/**
   ```

## 📱 Configuration PWA

### Créer les icônes

1. Créez un logo carré 512x512px
2. Utilisez un outil comme [realfavicongenerator.net](https://realfavicongenerator.net/)
3. Générez les icônes :
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
4. Placez-les dans `public/`

### Tester l'installation PWA

1. Ouvrez l'app sur mobile (Chrome Android)
2. Menu > "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une app native

## 🔍 Monitoring et Analytics

### Vercel Analytics (inclus gratuitement)

1. Dans Vercel, allez dans **Analytics**
2. Activez Web Analytics
3. Suivez :
   - Visiteurs uniques
   - Pages vues
   - Performance

### Supabase Monitoring

1. Dans Supabase, allez dans **Database** > **Usage**
2. Surveillez :
   - Nombre de requêtes
   - Espace utilisé
   - Bande passante

## 🐛 Troubleshooting

### Erreur : "Invalid API Key"

**Solution** :
- Vérifiez que les variables d'environnement sont bien configurées dans Vercel
- Redéployez : `vercel --prod`

### Erreur : "Table does not exist"

**Solution** :
- Le schéma SQL n'a pas été exécuté correctement
- Retournez dans Supabase SQL Editor
- Réexécutez `lib/supabase/schema.sql`

### Erreur : "Failed to upload logo"

**Solution** :
- Vérifiez que le bucket `logos` existe dans Supabase Storage
- Vérifiez qu'il est bien **public**
- Vérifiez les permissions RLS

### Build échoue sur Vercel

**Solution** :
```bash
# Localement, testez le build
npm run build

# Si ça fonctionne localement mais pas sur Vercel :
# - Vérifiez les versions Node.js (doit être 18+)
# - Dans Vercel Settings > General > Node.js Version : 18.x
```

## 🔐 Sécurité en production

### Checklist de sécurité

- [x] HTTPS activé (automatique avec Vercel)
- [x] RLS activé sur toutes les tables Supabase
- [x] Variables d'environnement sécurisées
- [x] Clés API publiques uniquement (anon key)
- [ ] Configurer rate limiting (Supabase Pro)
- [ ] Activer 2FA sur Vercel et Supabase
- [ ] Sauvegardes automatiques (Supabase Pro)

## 📊 Limites du plan gratuit

### Vercel Free
- ✅ Bande passante : 100GB/mois (largement suffisant)
- ✅ Builds : Illimités
- ✅ Domaines personnalisés : Illimités
- ✅ SSL automatique

### Supabase Free
- ✅ Base de données : 500MB (suffisant pour 1000+ utilisateurs)
- ✅ Storage : 1GB (suffisant pour logos)
- ✅ Bande passante : 2GB/mois
- ⚠️ Projet en pause après 1 semaine d'inactivité (se réactive automatiquement)

## 🚀 Mise à jour de l'application

### Déploiement continu (GitHub + Vercel)

Chaque fois que vous poussez sur GitHub, Vercel redéploie automatiquement :

```bash
# Faire des modifications
git add .
git commit -m "Ajout de fonctionnalité X"
git push

# Vercel redéploie automatiquement !
```

### Déploiement manuel (CLI)

```bash
vercel --prod
```

## 📈 Scaling

Quand vous dépassez les limites gratuites :

### Supabase Pro ($25/mois)
- 8GB base de données
- 100GB storage
- 250GB bande passante
- Pas de pause d'inactivité
- Sauvegardes automatiques

### Vercel Pro ($20/mois)
- 1TB bande passante
- Analytics avancés
- Support prioritaire

## ✅ Déploiement réussi !

Votre application est maintenant en ligne et accessible à :
- 🌐 URL : `https://devisrapide.vercel.app`
- 📱 Installable comme PWA
- 🔒 Sécurisée avec HTTPS
- 📊 Monitorée avec Analytics

**Prochaines étapes** :
1. Testez toutes les fonctionnalités
2. Invitez 5-10 beta testeurs
3. Collectez les feedbacks
4. Itérez et améliorez !

---

**Besoin d'aide ?** Consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)

