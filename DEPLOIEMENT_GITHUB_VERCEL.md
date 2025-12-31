# 🚀 Guide de déploiement - GitHub + Vercel

## 📋 Prérequis

- Compte GitHub
- Compte Vercel
- Compte Supabase
- Compte Stripe (pour les paiements)

## 🔧 Étape 1 : Préparation du code

### 1.1 Vérifier les modifications

```bash
# Vérifier l'état du dépôt
git status

# Voir les modifications
git diff
```

### 1.2 Ajouter les fichiers modifiés

```bash
# Ajouter tous les fichiers modifiés
git add .

# Ou ajouter fichier par fichier
git add app/page.tsx
git add lib/pdf/quote-pdf.tsx
git add app/(app)/devis/[id]/page.tsx
git add .env.example
git add DEPLOIEMENT_GITHUB_VERCEL.md
```

### 1.3 Commit des modifications

```bash
# Créer un commit avec un message descriptif
git commit -m "feat: amélioration PDF beige professionnel, filigrane .com, préparation déploiement"
```

## 📤 Étape 2 : Push vers GitHub

### 2.1 Vérifier la branche

```bash
# Voir la branche actuelle
git branch

# Si vous n'êtes pas sur main/master, basculez
git checkout main
# ou
git checkout master
```

### 2.2 Push vers GitHub

```bash
# Push vers GitHub
git push origin main
# ou
git push origin master
```

Si c'est la première fois, créez le dépôt sur GitHub puis :

```bash
# Ajouter le remote
git remote add origin https://github.com/VOTRE_USERNAME/DevisRapide.git

# Push
git push -u origin main
```

## 🌐 Étape 3 : Configuration Vercel

### 3.1 Lier le projet à Vercel

#### Option A : Via Dashboard Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **Add New Project**
3. Importez votre dépôt GitHub
4. Sélectionnez le projet `DevisRapide`
5. Vercel détectera automatiquement Next.js

#### Option B : Via CLI

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Suivre les instructions
```

### 3.2 Configurer les variables d'environnement

#### Via Dashboard Vercel

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez chaque variable :

**Variables Supabase (OBLIGATOIRES)** :
```
NEXT_PUBLIC_SUPABASE_URL = https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Variables Stripe (OBLIGATOIRES pour paiements)** :
```
STRIPE_SECRET_KEY = sk_test_...
STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_PRICE_ID = price_...
```

**Variables optionnelles** :
```
NEXT_PUBLIC_APP_URL = https://devisrapide.com
STRIPE_PAYMENT_LINK = https://buy.stripe.com/test_...
```

3. Sélectionnez les environnements : **Production**, **Preview**, **Development**

#### Via CLI

```bash
# Ajouter une variable pour production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Coller la valeur quand demandé

# Répéter pour preview et development
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL development

# Répéter pour toutes les variables
```

### 3.3 Script automatique (PowerShell)

Créez un fichier `setup-vercel-env.ps1` :

```powershell
# Lire les variables depuis .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "Fichier .env.local introuvable!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile

# Fonction pour ajouter une variable
function Add-VercelEnv {
    param($name, $value, $environments)
    
    foreach ($env in $environments) {
        Write-Host "Ajout de $name pour $env..." -ForegroundColor Yellow
        echo $value | vercel env add $name $env
    }
}

# Variables à ajouter
$variables = @(
    @{Name="NEXT_PUBLIC_SUPABASE_URL"; Envs=@("production","preview","development")},
    @{Name="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Envs=@("production","preview","development")},
    @{Name="STRIPE_SECRET_KEY"; Envs=@("production","preview","development")},
    @{Name="STRIPE_PUBLISHABLE_KEY"; Envs=@("production","preview","development")},
    @{Name="STRIPE_WEBHOOK_SECRET"; Envs=@("production","preview","development")},
    @{Name="STRIPE_PRICE_ID"; Envs=@("production","preview","development")}
)

foreach ($var in $variables) {
    $line = $envContent | Select-String "^$($var.Name)="
    if ($line) {
        $value = $line.ToString().Split('=',2)[1].Trim()
        if ($value) {
            Add-VercelEnv -name $var.Name -value $value -environments $var.Envs
        }
    }
}

Write-Host "Configuration terminée!" -ForegroundColor Green
```

Exécutez :
```powershell
.\setup-vercel-env.ps1
```

## 🚀 Étape 4 : Déploiement

### 4.1 Déploiement automatique

Une fois le projet lié à GitHub, chaque push déclenche un déploiement automatique :

```bash
# Push déclenche automatiquement le déploiement
git push origin main
```

### 4.2 Déploiement manuel

```bash
# Déployer en production
vercel --prod

# Déployer en preview
vercel
```

### 4.3 Vérifier le déploiement

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Vérifiez les logs de déploiement
4. Testez l'URL de production

## 🔍 Étape 5 : Configuration Supabase

### 5.1 Configurer les URLs autorisées

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** > **API** > **URL Configuration**
4. Ajoutez votre domaine Vercel :
   - `https://votre-projet.vercel.app`
   - `https://devisrapide.com` (si vous avez un domaine personnalisé)

### 5.2 Configurer les redirect URLs (Auth)

1. **Settings** > **Authentication** > **URL Configuration**
2. Ajoutez dans **Redirect URLs** :
   - `https://votre-projet.vercel.app/**`
   - `https://votre-projet.vercel.app/auth/callback`

## 🔔 Étape 6 : Configuration Stripe Webhook

### 6.1 Créer le webhook dans Stripe

1. Allez sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **Add endpoint**
3. URL du webhook : `https://votre-projet.vercel.app/api/stripe/webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copiez le **Signing secret** (commence par `whsec_`)
6. Ajoutez-le dans Vercel : `STRIPE_WEBHOOK_SECRET`

## ✅ Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Projet lié à Vercel
- [ ] Variables d'environnement configurées dans Vercel
- [ ] URLs autorisées configurées dans Supabase
- [ ] Redirect URLs configurées dans Supabase Auth
- [ ] Webhook Stripe configuré
- [ ] Déploiement réussi
- [ ] Application testée en production
- [ ] Paiements Stripe testés

## 🐛 Résolution de problèmes

### Erreur : Variables d'environnement manquantes

**Solution** : Vérifiez que toutes les variables sont ajoutées dans Vercel Settings > Environment Variables

### Erreur : Supabase RLS (Row Level Security)

**Solution** : Vérifiez que les politiques RLS sont correctement configurées dans Supabase

### Erreur : Webhook Stripe non reçu

**Solution** : 
1. Vérifiez que l'URL du webhook est correcte
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
3. Testez avec Stripe CLI : `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Erreur : Build échoue

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Testez localement : `npm run build`
3. Vérifiez les erreurs TypeScript : `npm run lint`

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
