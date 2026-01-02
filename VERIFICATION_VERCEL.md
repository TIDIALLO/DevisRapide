# ✅ Vérification avant déploiement Vercel

## 🔍 Checklist des variables d'environnement

Avant de déployer, assurez-vous que **TOUTES** ces variables sont configurées dans Vercel :

### Variables Supabase (OBLIGATOIRES)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Variables Stripe (OBLIGATOIRES pour paiements PRO)

```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
```

### Variables optionnelles

```
NEXT_PUBLIC_APP_URL (ex: https://devisrapide.vercel.app)
STRIPE_PAYMENT_LINK (optionnel)
```

## 📋 Comment vérifier/ajouter les variables

### Via Dashboard Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez le projet `devisrapide`
3. **Settings** > **Environment Variables**
4. Vérifiez que toutes les variables ci-dessus sont présentes
5. Pour chaque variable, sélectionnez : **Production**, **Preview**, **Development**

### Via CLI

```bash
# Vérifier les variables existantes
vercel env ls

# Ajouter une variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Coller la valeur quand demandé
```

## 🚀 Commandes de déploiement

```bash
# Déployer en production
vercel --prod

# Déployer en preview
vercel

# Vérifier le statut
vercel ls
```

## ⚠️ Notes importantes

1. **L'avertissement middleware** : C'est normal, Next.js 16.1.0 indique que `middleware.ts` sera remplacé par `proxy` dans une future version. Pour l'instant, cela fonctionne parfaitement.

2. **Build local réussi** : Si `npm run build` fonctionne localement, le déploiement Vercel devrait aussi fonctionner.

3. **Variables manquantes** : Si des variables sont manquantes, l'application peut planter au runtime. Vérifiez toujours les logs Vercel après déploiement.

## 🔗 URLs importantes

- **Dashboard Vercel** :** https://vercel.com/dashboard
- **Inspect Deployment** : https://vercel.com/tidiallos-projects/devisrapide/[deployment-id]
- **Supabase Dashboard** : https://supabase.com/dashboard
- **Stripe Dashboard** : https://dashboard.stripe.com/

## ✅ Après le déploiement

1. Vérifiez les logs de déploiement sur Vercel
2. Testez l'URL de production
3. Vérifiez que l'authentification fonctionne
4. Testez la création d'un devis
5. Vérifiez que les paiements Stripe fonctionnent (mode test)
