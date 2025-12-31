# Guide d'intégration Stripe + Bictorys - DevisRapide

## Architecture de paiement hybride

Votre application utilise maintenant **deux systèmes de paiement complémentaires** :

### 1. **Stripe** 💳
- **Usage** : Abonnements PRO récurrents
- **Avantages** : Gestion automatique des renouvellements, cartes bancaires internationales
- **Méthode** : Carte bancaire uniquement

### 2. **Bictorys** 📱
- **Usage** : Paiements de factures ponctuels
- **Avantages** : Mobile Money local (Wave, Orange Money)
- **Méthode** : Wave, Orange Money, Carte

---

## Configuration terminée ✅

### Variables d'environnement

```env
# Stripe - ABONNEMENTS PRO
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SjUX2PtXAmC1Epu...
STRIPE_SECRET_KEY=sk_test_51SjUX2PtXAmC1Epu...
STRIPE_WEBHOOK_SECRET=whsec_stripe_devisrapide_2025
STRIPE_PRICE_ID=price_1SjUlLPtXAmC1Epufb0TiZAq

# Bictorys - PAIEMENTS FACTURES
BICTORYS_API_KEY_PUBLIC=test_public-04933180-e92f-460b-95d5...
BICTORYS_API_KEY_SECRET=test_secret-04933180-e92f-460b-95d5...
```

### Schema de base de données mis à jour

La table `payments` support maintenant les deux fournisseurs :

```sql
- payment_provider: 'bictorys' | 'stripe'
- payment_type: 'orange_money' | 'wave' | 'card' | 'stripe_card' | 'stripe_subscription'
- stripe_session_id: ID de session Stripe Checkout
- stripe_subscription_id: ID de l'abonnement Stripe
- subscription_status: 'active' | 'canceled' | 'past_due' | ...
- is_subscription: boolean (true pour les abonnements)
```

---

## Flux de paiement

### Abonnement PRO (Stripe)

```
1. Utilisateur clique sur "Passer PRO"
   ↓
2. Appel API → /api/stripe/create-checkout-session (avec isUpgrade: true)
   ↓
3. Création client Stripe (si premier paiement)
   ↓
4. Création session Stripe Checkout avec mode='subscription'
   ↓
5. Redirection vers Stripe Checkout
   ↓
6. Utilisateur saisit sa carte bancaire
   ↓
7. Webhook Stripe → checkout.session.completed
   ↓
8. Mise à jour user.plan = 'pro' et user.stripe_subscription_id
   ↓
9. Redirection vers /upgrade/succes
```

### Paiement facture (Bictorys)

```
1. Utilisateur clique sur "Payer en ligne" sur une facture
   ↓
2. Modal s'affiche avec choix Wave/Orange Money/Carte
   ↓
3. Appel API → /api/bictorys/create-charge
   ↓
4. Redirection vers page Bictorys
   ↓
5. Paiement mobile money ou carte
   ↓
6. Webhook Bictorys → charge.succeeded
   ↓
7. Mise à jour payment.status = 'succeeded'
   ↓
8. Redirection vers /paiement/succes
```

---

## Étapes de déploiement

### Étape 1 : Exécuter le SQL dans Supabase

```sql
-- Exécuter le fichier: lib/supabase/UPDATE_PAYMENTS_SUBSCRIPTIONS.sql
-- Cela ajoute les colonnes Stripe à la table payments et users
```

### Étape 2 : Configurer le Webhook Stripe

1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez sur "Add endpoint"
3. Configurez :
   ```
   URL: https://votre-domaine.com/api/stripe/webhook

   Événements à écouter:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
   ```
4. Copiez le **Signing secret** (commence par `whsec_`)
5. Ajoutez-le dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_...`

### Étape 3 : Tester en local avec Stripe CLI

```bash
# Installer Stripe CLI
# https://stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Écouter les webhooks en local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Dans un autre terminal, tester un paiement
stripe trigger checkout.session.completed
```

### Étape 4 : Vérifier le Price ID Stripe

Dans votre dashboard Stripe :
1. Allez dans **Products** → **Prices**
2. Vérifiez que le price `price_1SjUlLPtXAmC1Epufb0TiZAq` existe
3. Vérifiez qu'il est configuré pour :
   - Montant : 5000 (ou votre prix)
   - Devise : XOF
   - Type : Récurrent (mensuel)

---

## Gestion des abonnements

### Renouvellement automatique

Stripe gère automatiquement :
- ✅ Facturation mensuelle
- ✅ Mise à jour de `plan_expires_at`
- ✅ Retry en cas de paiement échoué
- ✅ Notifications par email

### Annulation d'abonnement

Les utilisateurs peuvent annuler via le dashboard Stripe ou vous pouvez implémenter :

```typescript
// Dans votre profil utilisateur
const subscription = await stripe.subscriptions.update(
  user.stripe_subscription_id,
  { cancel_at_period_end: true }
);
```

### Paiement échoué

Si un paiement mensuel échoue :
1. Webhook `invoice.payment_failed` est appelé
2. `subscription_status` devient `'past_due'`
3. Stripe réessaie automatiquement
4. Vous pouvez envoyer une notification à l'utilisateur

---

## Tests recommandés

### Checklist Stripe

- [ ] **Créer un abonnement** : Tester avec carte test `4242 4242 4242 4242`
- [ ] **Webhook reçu** : Vérifier que user.plan devient 'pro'
- [ ] **Page de succès** : Vérifier la redirection vers /upgrade/succes
- [ ] **Annulation** : Tester l'annulation d'abonnement
- [ ] **Paiement échoué** : Tester avec carte test `4000 0000 0000 0341`

### Cartes de test Stripe

| Carte | Résultat |
|-------|----------|
| `4242 4242 4242 4242` | ✅ Réussit |
| `4000 0000 0000 0341` | ❌ Échoue (refusé) |
| `4000 0025 0000 3155` | ⚠️ Nécessite 3D Secure |

### Checklist Bictorys

- [ ] Table `payments` créée dans Supabase
- [ ] Paiement Wave testé
- [ ] Paiement Orange Money testé
- [ ] Webhook Bictorys configuré
- [ ] Page de succès facture testée

---

## Différences clés

### Stripe (Abonnements)

- ✅ **Récurrent automatique** : Pas besoin de re-payer chaque mois
- ✅ **International** : Cartes du monde entier
- ✅ **Gestion simplifiée** : Stripe gère les retries, emails, etc.
- ❌ **Pas de mobile money** : Que des cartes bancaires

### Bictorys (Paiements ponctuels)

- ✅ **Mobile Money local** : Wave, Orange Money
- ✅ **Adapté au Sénégal** : Méthodes populaires localement
- ✅ **Paiements instantanés** : Confirmation immédiate
- ❌ **Paiement unique** : Pas de gestion d'abonnement

---

## URLs importantes

### Stripe

- Dashboard Test : https://dashboard.stripe.com/test
- Dashboard Production : https://dashboard.stripe.com
- Documentation : https://stripe.com/docs

### Bictorys

- Dashboard : https://dashboard.bictorys.com
- Documentation : https://docs.bictorys.com

---

## Résolution de problèmes

### Erreur "Price not found"

```
Solution :
1. Vérifiez que STRIPE_PRICE_ID est correct dans .env.local
2. Vérifiez que le Price existe dans votre dashboard Stripe
3. Vérifiez que le Price est actif (not archived)
```

### Webhook non reçu (Stripe)

```
Solution :
1. En local : Utilisez Stripe CLI pour forwarder les webhooks
2. En production : Vérifiez que l'URL webhook est accessible (HTTPS)
3. Vérifiez les logs dans Stripe Dashboard → Webhooks
```

### Abonnement non activé

```
Solution :
1. Vérifiez les logs du webhook dans Supabase Functions
2. Vérifiez que user_id est bien dans metadata
3. Vérifiez que la table users a les colonnes stripe_*
```

---

## Prochaines améliorations possibles

1. **Portal client Stripe** : Permettre aux utilisateurs de gérer leur abonnement
2. **Codes promo** : Ajouter des coupons Stripe
3. **Factures automatiques** : Envoyer les factures Stripe par email
4. **Analytics** : Suivre les revenus dans un dashboard
5. **Webhooks Slack** : Notifications d'abonnements en temps réel

---

## Checklist de mise en production

### Stripe

- [ ] Obtenir les clés de PRODUCTION (pk_live_... et sk_live_...)
- [ ] Créer le Price en PRODUCTION avec même montant
- [ ] Configurer le webhook en PRODUCTION
- [ ] Activer le mode LIVE dans le dashboard
- [ ] Tester avec une vraie carte (montant minimum)

### Bictorys

- [ ] Obtenir les clés de PRODUCTION
- [ ] Compléter la vérification KYC
- [ ] Configurer le webhook en PRODUCTION
- [ ] Tester avec un vrai paiement mobile money

### Variables d'environnement (Production)

```env
# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... (ID production)

# Bictorys Production
BICTORYS_API_KEY_PUBLIC=prod_public-...
BICTORYS_API_KEY_SECRET=prod_secret-...
BICTORYS_ENVIRONMENT=production
```

---

## Support

### Stripe

- Documentation : https://stripe.com/docs
- Support : support@stripe.com
- Community : https://stripe.com/community

### Bictorys

- Documentation : https://docs.bictorys.com
- Support : support@bictorys.com

---

## Résumé de l'architecture

```
📊 DevisRapide
├── 💳 Stripe (Abonnements PRO)
│   ├── Checkout Session
│   ├── Subscription récurrent
│   ├── Webhook events
│   └── Customer Portal (à venir)
│
└── 📱 Bictorys (Paiements factures)
    ├── Wave Money
    ├── Orange Money
    ├── Carte bancaire
    └── Webhook events
```

---

**Dernière mise à jour** : 28 Décembre 2025
**Status** : ✅ Prêt pour les tests
**Version** : 2.0.0 (Stripe + Bictorys)

Vous avez maintenant le meilleur des deux mondes :
- **Stripe** pour les abonnements professionnels internationaux
- **Bictorys** pour les paiements locaux mobile money !

🚀 **Votre application est prête pour le succès !**
