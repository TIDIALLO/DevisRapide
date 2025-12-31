# 🔧 Configuration Stripe - Variables d'environnement

## Variables à ajouter dans `.env.local`

```env
# Stripe API Keys (Test)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret
# À obtenir depuis le dashboard Stripe après avoir configuré le webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Checkout URL (lien public)
STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_dRm5kFc3O9hb3968ITfbq00tu
```

## 📋 Configuration du Webhook Stripe

1. **Accéder au dashboard Stripe** : [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Aller dans Developers → Webhooks**
3. **Cliquer sur "Add endpoint"**
4. **Configurer** :
   - URL : `https://votre-domaine.com/api/stripe/webhook`
   - Événements à sélectionner :
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
5. **Copier le Signing secret** (commence par `whsec_`)
6. **Ajouter à `.env.local`** comme `STRIPE_WEBHOOK_SECRET`

## 🔄 Migration depuis Bictorys

Le code Bictorys pour les abonnements a été mis en commentaire dans :
- `app/api/bictorys/create-upgrade-charge/route.ts`

L'application utilise maintenant :
- **Stripe Checkout public** pour les abonnements PRO
- **Route API** : `/api/stripe/upgrade-pro`

## 📝 Mise à jour de la base de données

Exécutez le script SQL :
```sql
-- Fichier: lib/supabase/UPDATE_PAYMENTS_TABLE_STRIPE_FINAL.sql
```

Ce script ajoute :
- `stripe_session_id` : ID de session Stripe (si créée via API)
- `stripe_checkout_url` : URL publique Stripe Checkout (lien direct)
- Mise à jour des contraintes pour inclure 'stripe' dans `payment_type`

## ✅ Vérification

Après configuration :
1. Redémarrer le serveur : `npm run dev`
2. Tester l'upgrade PRO : `/upgrade`
3. Vérifier que la redirection vers Stripe fonctionne
4. Tester avec une carte de test : `4242 4242 4242 4242`
