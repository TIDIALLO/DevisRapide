# 🎯 Commandes Essentielles - DevisRapide

## 📦 Installation

```bash
# Se placer dans le dossier du projet
cd devisrapide

# Installer les dépendances
npm install
```

## 🚀 Développement

```bash
# Lancer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:3000
```

## 🏗️ Build & Production

```bash
# Créer un build de production
npm run build

# Lancer le serveur de production (après build)
npm run start
```

## 🔍 Linting

```bash
# Vérifier le code
npm run lint
```

## 📝 Configuration initiale

### 1. Créer le fichier .env.local

```bash
# Copier le fichier exemple (si disponible)
# Sinon, créer manuellement :

# Windows (PowerShell)
New-Item -Path ".env.local" -ItemType File

# Mac/Linux
touch .env.local
```

### 2. Ajouter les variables d'environnement

Ouvrir `.env.local` et ajouter :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur https://supabase.com
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Attendre 2-3 minutes (création de la base de données)

### 2. Exécuter le schéma SQL

```bash
# 1. Ouvrir Supabase Dashboard
# 2. Aller dans "SQL Editor"
# 3. Copier le contenu de lib/supabase/schema.sql
# 4. Coller et cliquer "Run"
```

### 3. Créer le bucket Storage

```bash
# 1. Aller dans "Storage"
# 2. Cliquer "Create bucket"
# 3. Nom: logos
# 4. Public: OUI
# 5. Cliquer "Create"
```

### 4. Récupérer les clés API

```bash
# 1. Aller dans "Settings" > "API"
# 2. Copier "Project URL" → NEXT_PUBLIC_SUPABASE_URL
# 3. Copier "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Coller dans .env.local
```

## 🚀 Déploiement sur Vercel

### Via GitHub (Recommandé)

```bash
# 1. Initialiser Git
git init
git add .
git commit -m "Initial commit - DevisRapide"

# 2. Créer un repo sur GitHub
# Aller sur github.com > New repository > devisrapide

# 3. Pousser le code
git remote add origin https://github.com/VOTRE-USERNAME/devisrapide.git
git branch -M main
git push -u origin main

# 4. Déployer sur Vercel
# - Aller sur vercel.com
# - Connecter GitHub
# - Importer le repo "devisrapide"
# - Ajouter les variables d'environnement
# - Cliquer "Deploy"
```

### Via CLI Vercel

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel

# 4. Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 5. Déployer en production
vercel --prod
```

## 🧹 Nettoyage

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Supprimer le cache Next.js
rm -rf .next

# Rebuild complet
npm run build
```

## 🔧 Dépannage

### Erreur : "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
npm run dev -- -p 3001
```

### Erreur : "Supabase connection failed"

```bash
# 1. Vérifier .env.local existe
# 2. Vérifier les variables commencent par NEXT_PUBLIC_
# 3. Redémarrer le serveur
# Ctrl+C puis npm run dev
```

## 📊 Commandes utiles

### Vérifier la version de Node

```bash
node --version
# Doit être >= 18.0.0
```

### Mettre à jour les dépendances

```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour une dépendance spécifique
npm install next@latest
```

### Analyser la taille du bundle

```bash
# Installer l'outil
npm install -g @next/bundle-analyzer

# Analyser
ANALYZE=true npm run build
```

## 🎨 Personnalisation

### Changer le port de développement

```bash
# Lancer sur le port 3001
npm run dev -- -p 3001
```

### Activer le mode turbo (plus rapide)

```bash
# Ajouter dans package.json > scripts > dev
"dev": "next dev --turbo"
```

## 📱 Tester sur mobile

### Sur le même réseau WiFi

```bash
# 1. Lancer le serveur
npm run dev

# 2. Trouver votre IP locale
# Windows
ipconfig
# Chercher "IPv4 Address"

# Mac/Linux
ifconfig
# Chercher "inet"

# 3. Sur mobile, ouvrir
http://VOTRE-IP:3000
# Exemple : http://192.168.1.100:3000
```

## 🔐 Sécurité

### Ne JAMAIS committer .env.local

```bash
# Vérifier que .env.local est dans .gitignore
cat .gitignore | grep .env

# Si vous l'avez committé par erreur :
git rm --cached .env.local
git commit -m "Remove .env.local"
```

## 📚 Documentation

### Ouvrir la documentation

```bash
# Next.js
open https://nextjs.org/docs

# Supabase
open https://supabase.com/docs

# Tailwind CSS
open https://tailwindcss.com/docs
```

## 🎯 Workflow recommandé

### Développement quotidien

```bash
# 1. Mettre à jour le code (si Git)
git pull

# 2. Installer les nouvelles dépendances (si package.json a changé)
npm install

# 3. Lancer le serveur
npm run dev

# 4. Faire des modifications

# 5. Tester

# 6. Committer
git add .
git commit -m "Description des changements"
git push
```

### Avant de déployer

```bash
# 1. Vérifier qu'il n'y a pas d'erreurs
npm run lint

# 2. Tester le build de production
npm run build
npm run start

# 3. Tester l'application sur http://localhost:3000

# 4. Si tout fonctionne, déployer
git push
# Vercel redéploie automatiquement
```

## 🆘 Aide

### En cas de problème

1. **Lire les erreurs** : Les messages d'erreur sont précis
2. **Vérifier .env.local** : 90% des problèmes viennent de là
3. **Redémarrer le serveur** : Ctrl+C puis `npm run dev`
4. **Nettoyer et rebuild** : `rm -rf .next && npm run build`
5. **Réinstaller** : `rm -rf node_modules && npm install`

### Ressources

- Documentation Next.js : https://nextjs.org/docs
- Documentation Supabase : https://supabase.com/docs
- Documentation Tailwind : https://tailwindcss.com/docs
- Stack Overflow : https://stackoverflow.com

## ✅ Checklist de démarrage

- [ ] Node.js 18+ installé
- [ ] Projet cloné/téléchargé
- [ ] `npm install` exécuté
- [ ] Compte Supabase créé
- [ ] Schéma SQL exécuté
- [ ] Bucket `logos` créé
- [ ] Fichier `.env.local` créé
- [ ] Variables d'environnement ajoutées
- [ ] `npm run dev` fonctionne
- [ ] Application accessible sur http://localhost:3000
- [ ] Inscription testée
- [ ] Création de devis testée

## 🎉 Prêt !

Si toutes les cases sont cochées, tu es prêt à développer et déployer DevisRapide !

---

**Aide supplémentaire** : Consulte `GUIDE_DEMARRAGE.md` pour des explications détaillées

