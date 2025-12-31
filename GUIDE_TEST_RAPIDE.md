# 🚀 Guide de test rapide - Stripe + Bictorys

## ✅ Étape 1 : Exécuter le SQL dans Supabase

### Option A : Via l'interface Supabase (RECOMMANDÉ)

1. **Ouvrez** : https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql

2. **Copiez** tout le SQL ci-dessous :

```sql
-- Ajouter colonnes Stripe
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'bictorys' CHECK (payment_provider IN ('bictorys', 'stripe')),
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', NULL)),
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE payments ADD CONSTRAINT payments_payment_type_check CHECK (payment_type IN ('orange_money', 'wave', 'card', 'stripe_card', 'stripe_subscription'));

CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer ON payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_subscription ON payments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_status ON payments(subscription_status);

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE, ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);
```

3. **Collez** dans l'éditeur SQL de Supabase

4. **Cliquez** sur "Run" (ou Ctrl+Enter)

5. **Vérifiez** : Vous devriez voir "Success. No rows returned"

---

## ✅ Étape 2 : Tester l'abonnement Stripe

### 1. Ouvrir la page d'upgrade

URL : http://localhost:3000/upgrade

### 2. Cliquer sur le bouton

"S'abonner avec Stripe - 5,000 FCFA/mois"

### 3. Vous serez redirigé vers Stripe Checkout

### 4. Utiliser une carte de test

```
Numéro de carte : 4242 4242 4242 4242
Date d'expiration : 12/34 (ou n'importe quelle date future)
CVC : 123 (ou n'importe quel 3 chiffres)
Nom : Votre nom
```

### 5. Valider le paiement

### 6. Vérifier la redirection

Vous devriez être redirigé vers : `/upgrade/succes`

### 7. Vérifier dans Supabase

```sql
-- Vérifier que l'utilisateur est PRO
SELECT id, email, plan, plan_expires_at, stripe_customer_id, stripe_subscription_id
FROM users
WHERE email = 'votre-email@example.com';

-- Vérifier le paiement
SELECT * FROM payments
WHERE payment_provider = 'stripe'
ORDER BY created_at DESC
LIMIT 1;
```

---

## ✅ Étape 3 : Tester le paiement de facture Bictorys

### 1. Créer une facture

1. Allez sur : http://localhost:3000/devis/nouveau
2. Sélectionnez "Facture" comme type de document
3. Remplissez les informations
4. Sauvegardez

### 2. Cliquer sur "Payer en ligne"

Le bouton apparaîtra sur la page de détail de la facture

### 3. Choisir Wave ou Orange Money

Dans le modal qui s'ouvre

### 4. Compléter le paiement

Sur la page Bictorys (mode test)

---

## 🔍 Vérifications

### Vérifier les colonnes ajoutées

```sql
-- Dans Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments'
AND column_name LIKE '%stripe%';
```

Vous devriez voir :
- `stripe_session_id`
- `stripe_customer_id`
- `stripe_subscription_id`

### Vérifier les logs

Dans la console du navigateur (F12), vous devriez voir :
- Requête à `/api/stripe/create-checkout-session`
- Redirection vers Stripe
- Retour vers `/upgrade/succes`

---

## ⚠️ Problèmes courants

### "Error: payment_type must be one of..."

➡️ Le SQL n'a pas été exécuté correctement. Ré-exécutez le SQL.

### "Clé API Stripe invalide"

➡️ Vérifiez `.env.local` :
```env
STRIPE_SECRET_KEY=sk_test_51SjUX2PtXAmC1Epu...
```

### Pas de redirection après paiement

➡️ Webhook Stripe non configuré. Pour tester sans webhook :
- Le paiement est créé mais user.plan n'est pas mis à jour
- Configurez le webhook Stripe (voir GUIDE_STRIPE_INTEGRATION.md)

### "Table payments does not exist"

➡️ Exécutez d'abord : `lib/supabase/CREATE_PAYMENTS_TABLE.sql`

---

## 🎯 Résultat attendu

Après un test réussi :

1. ✅ Utilisateur créé dans Stripe Dashboard
2. ✅ Abonnement actif dans Stripe
3. ✅ `user.plan = 'pro'` dans Supabase
4. ✅ `user.stripe_subscription_id` rempli
5. ✅ Paiement enregistré dans table `payments`
6. ✅ Page de succès affichée

---

## 📊 Dashboard Stripe

Pour voir vos paiements de test :
https://dashboard.stripe.com/test/payments

---

**Besoin d'aide ?**
- Consultez `GUIDE_STRIPE_INTEGRATION.md`
- Vérifiez les logs dans la console
- Vérifiez les logs dans Stripe Dashboard → Logs
