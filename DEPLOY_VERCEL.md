# 🚀 Guide de déploiement sur Vercel

## ✅ Étape 1 : Projet lié

Le projet est déjà lié à Vercel :
- **Projet** : `devisrapide`
- **Organisation** : `tidiallos-projects`
- **Repository GitHub** : `https://github.com/TIDIALLO/DevisRapide`

## 📝 Étape 2 : Configuration des variables d'environnement

### Option A : Via CLI (Recommandé)

```bash
# Ajouter NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Coller votre URL Supabase (ex: https://xxxxx.supabase.co)
# Répéter pour preview et development

# Ajouter NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Coller votre clé anon Supabase
# Répéter pour preview et development
```

### Option B : Via Dashboard Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner le projet `devisrapide`
3. Aller dans **Settings** > **Environment Variables**
4. Ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anon Supabase
5. Sélectionner les environnements : **Production**, **Preview**, **Development**

### Option C : Script automatique (Windows PowerShell)

```powershell
# Lire les variables depuis .env.local et les ajouter à Vercel
$envContent = Get-Content .env.local
$supabaseUrl = ($envContent | Select-String "^NEXT_PUBLIC_SUPABASE_URL=").ToString().Split('=',2)[1].Trim()
$supabaseKey = ($envContent | Select-String "^NEXT_PUBLIC_SUPABASE_ANON_KEY=").ToString().Split('=',2)[1].Trim()

# Ajouter pour production
echo $supabaseUrl | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo $supabaseKey | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Ajouter pour preview
echo $supabaseUrl | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo $supabaseKey | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# Ajouter pour development
echo $supabaseUrl | vercel env add NEXT_PUBLIC_SUPABASE_URL development
echo $supabaseKey | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

## 🚀 Étape 3 : Déploiement

### Déploiement initial

```bash
vercel --prod
```

### Déploiements futurs

Les déploiements se feront automatiquement à chaque push sur GitHub :
- **Production** : push sur `main`
- **Preview** : push sur les autres branches

## 🔍 Vérification

Après le déploiement, vérifier :
1. Le build s'est terminé sans erreur
2. Les variables d'environnement sont bien configurées
3. L'application est accessible sur l'URL fournie par Vercel

## 📊 Monitoring

- **Dashboard Vercel** : [vercel.com/dashboard](https://vercel.com/dashboard)
- **Logs** : Disponibles dans le dashboard Vercel
- **Analytics** : Activables dans les paramètres du projet

## 🐛 Dépannage

### Erreur de build
- Vérifier que toutes les dépendances sont dans `package.json`
- Vérifier les logs de build dans Vercel

### Variables d'environnement non chargées
- Vérifier que les variables sont bien préfixées avec `NEXT_PUBLIC_` pour les variables publiques
- Redéployer après avoir ajouté/modifié les variables

### Erreur Supabase
- Vérifier que l'URL et la clé sont correctes
- Vérifier que le bucket `logos` existe dans Supabase Storage
- Vérifier que les tables sont créées dans Supabase

## 🔗 Liens utiles

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Next.js** : https://nextjs.org/docs
- **Dashboard Vercel** : https://vercel.com/dashboard

