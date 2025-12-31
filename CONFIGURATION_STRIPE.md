# 🔧 Configuration Stripe - DevisRapide

## ✅ Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx  # Clé secrète Stripe (commence par sk_test_ pour test, sk_live_ pour production)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Clé publique Stripe (commence par pk_test_ pour test, pk_live_ pour production)

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Secret du webhook (commence par whsec_)
```

## 📋 Où obtenir les clés Stripe

1. **Créer un compte Stripe** : [https://stripe.com](https://stripe.com)
2. **Récupérer les clés API** :
   - Allez dans **Developers** → **API keys**
   - Copiez la **Secret key** (commence par `sk_test_` en mode test)
   - Copiez la **Publishable key** (commence par `pk_test_` en mode test)

3. **Configurer le webhook** :
   - Allez dans **Developers** → **Webhooks**
   - Cliquez sur **Add endpoint**
   - URL : `https://votre-domaine.com/api/stripe/webhook`
   - Événements à sélectionner :
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
   - Copiez le **Signing secret** (commence par `whsec_`)
   - Ajoutez-le à `.env.local` comme `STRIPE_WEBHOOK_SECRET`

## 🔄 Migration depuis Bictorys

Le code Bictorys a été mis en commentaire. Pour revenir à Bictorys :
1. Décommentez le code dans `components/payment/payment-modal.tsx`
2. Utilisez les routes API `/api/bictorys/*` au lieu de `/api/stripe/*`

## 📝 Mise à jour de la base de données

Exécutez le script SQL pour ajouter le support Stripe :

```sql
-- Fichier: lib/supabase/UPDATE_PAYMENTS_TABLE_FOR_STRIPE.sql
```

Ce script ajoute :
- La colonne `stripe_session_id` à la table `payments`
- L'index pour améliorer les performances
- Mise à jour du CHECK pour inclure 'stripe' dans `payment_type`

## 🧪 Test en mode développement

Pour tester localement avec Stripe :

1. **Utiliser ngrok** pour exposer votre serveur local :
   ```bash
   ngrok http 3000
   ```

2. **Configurer le webhook dans Stripe** avec l'URL ngrok :
   ```
   https://xxxxx.ngrok.io/api/stripe/webhook
   ```

3. **Utiliser les cartes de test Stripe** :
   - Carte réussie : `4242 4242 4242 4242`
   - Carte refusée : `4000 0000 0000 0002`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres

## 🚀 Passage en production

1. **Basculer vers les clés de production** :
   - Remplacez `sk_test_` par `sk_live_`
   - Remplacez `pk_test_` par `pk_live_`

2. **Mettre à jour le webhook** :
   - Créez un nouveau webhook avec l'URL de production
   - Copiez le nouveau `STRIPE_WEBHOOK_SECRET`

3. **Vérifier la configuration** :
   - Testez un paiement réel avec un petit montant
   - Vérifiez que le webhook est bien reçu

## 📚 Documentation Stripe

- [Documentation Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
