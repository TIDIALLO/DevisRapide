# 🚀 Intégration Bictorys - Plan d'implémentation

## 📋 Compréhension de l'API Bictorys

D'après la [documentation Bictorys](https://docs.bictorys.com/docs/comprendre-lapi-de-paiement), voici comment fonctionne l'API :

### 1. Types d'intégration disponibles

- **Checkout** (Recommandé) : Redirige vers la page de paiement Bictorys
- **Iframe** : Intégration dans la page (pas encore disponible)
- **Direct API** : Nécessite certification PCI-DSS pour les cartes bancaires

### 2. Endpoint principal

```
POST https://api.test.bictorys.com/pay/v1/charges (Test)
POST https://api.bictorys.com/pay/v1/charges (Production)
```

### 3. Paramètres requis

**Headers :**
- `X-Api-Key` : Clé publique Bictorys
- `Content-Type: application/json`

**Body JSON :**
```json
{
  "amount": 100,              // Montant en centimes (ex: 100 = 1 FCFA)
  "currency": "XOF",          // XOF pour le Sénégal
  "country": "SN",            // Code pays
  "successRedirectUrl": "https://votre-site.com/paiement/succes",
  "ErrorRedirectUrl": "https://votre-site.com/paiement/erreur"
}
```

**Query Parameter :**
- `payment_type` : `orange_money`, `wave`, `card`, etc.

### 4. Flux de paiement

1. **Initiation** : Appel API avec les paramètres
2. **Redirection** : Client redirigé vers la page de paiement Bictorys
3. **Paiement** : Client paie sur la page Bictorys
4. **Webhook** : Bictorys envoie une notification à votre serveur
5. **Redirection** : Client redirigé vers `successRedirectUrl` ou `ErrorRedirectUrl`

---

## 🔧 Ce dont j'ai besoin pour l'implémentation

### 1. Variables d'environnement

Ajouter dans `.env.local` :

```env
# Bictorys API
BICTORYS_API_KEY_PUBLIC=public-xxxxx-xxxxx-xxxxx
BICTORYS_API_KEY_SECRET=secret-xxxxx-xxxxx-xxxxx
BICTORYS_WEBHOOK_SECRET=whsec_xxxxx
BICTORYS_ENVIRONMENT=test  # ou "production"
```

**Où obtenir les clés :**
1. Se connecter au [tableau de bord Bictorys](https://docs.bictorys.com/reference/getting-started)
2. Aller dans **Développeurs** → **Configuration des clés API**
3. Générer les clés (Test ou Production)
4. ⚠️ **Important** : Vous ne pouvez copier la clé qu'une seule fois après l'avoir générée

### 2. Table de base de données pour les transactions

Créer une table `payments` dans Supabase :

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  bictorys_charge_id TEXT UNIQUE,  -- ID de la transaction Bictorys
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  payment_type TEXT NOT NULL,  -- orange_money, wave, card
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, succeeded, failed, canceled
  success_redirect_url TEXT,
  error_redirect_url TEXT,
  metadata JSONB,  -- Données supplémentaires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_quote_id ON payments(quote_id);
CREATE INDEX idx_payments_bictorys_charge_id ON payments(bictorys_charge_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 3. Structure de fichiers à créer

```
lib/
  bictorys/
    client.ts          # Client API Bictorys
    types.ts           # Types TypeScript
    webhook.ts         # Validation des webhooks

app/
  api/
    bictorys/
      create-charge/
        route.ts       # API route pour créer une charge
      webhook/
        route.ts       # API route pour recevoir les webhooks
  (app)/
    paiement/
      [chargeId]/
        page.tsx       # Page de redirection (succès/erreur)
```

### 4. Fonctionnalités à implémenter

#### A. Page de sélection du mode de paiement

Sur la page de détail d'une facture (`app/(app)/devis/[id]/page.tsx`), ajouter un bouton "Payer en ligne" qui :
- Affiche un modal avec les options : Orange Money, Wave, Carte bancaire
- Permet de sélectionner le mode de paiement
- Initie le paiement via l'API Bictorys

#### B. API Route pour créer une charge

`app/api/bictorys/create-charge/route.ts` :
- Reçoit : `quoteId`, `paymentType`, `amount`
- Crée une transaction dans la table `payments`
- Appelle l'API Bictorys
- Retourne l'URL de redirection

#### C. API Route pour les webhooks

`app/api/bictorys/webhook/route.ts` :
- Valide la signature du webhook (sécurité)
- Met à jour le statut de la transaction
- Met à jour le statut de la facture si nécessaire
- Envoie une notification à l'utilisateur

#### D. Pages de redirection

`app/(app)/paiement/[chargeId]/page.tsx` :
- Affiche le statut du paiement (succès/erreur)
- Redirige vers la facture après quelques secondes
- Affiche un message approprié

### 5. Types TypeScript à créer

```typescript
// lib/bictorys/types.ts

export type PaymentType = 'orange_money' | 'wave' | 'card';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface CreateChargeRequest {
  amount: number;
  currency: string;
  country: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  payment_type: PaymentType;
  metadata?: {
    quote_id?: string;
    user_id?: string;
  };
}

export interface CreateChargeResponse {
  id: string;
  status: PaymentStatus;
  checkout_url: string;
  // ... autres champs
}

export interface WebhookPayload {
  event: string;
  data: {
    id: string;
    status: PaymentStatus;
    amount: number;
    // ... autres champs
  };
}
```

---

## 🎯 Plan d'implémentation

### Phase 1 : Configuration de base
1. ✅ Créer les variables d'environnement
2. ✅ Créer la table `payments` dans Supabase
3. ✅ Créer le client API Bictorys
4. ✅ Créer les types TypeScript

### Phase 2 : API Routes
1. ✅ Créer l'API route pour initier un paiement
2. ✅ Créer l'API route pour les webhooks
3. ✅ Tester les appels API

### Phase 3 : Interface utilisateur
1. ✅ Ajouter le bouton "Payer en ligne" sur la page de facture
2. ✅ Créer le modal de sélection du mode de paiement
3. ✅ Créer les pages de redirection (succès/erreur)
4. ✅ Ajouter les notifications de statut

### Phase 4 : Tests et validation
1. ✅ Tester avec l'environnement de test Bictorys
2. ✅ Valider les webhooks
3. ✅ Tester tous les modes de paiement
4. ✅ Passer en production

---

## 📝 Questions à clarifier

1. **Quel type d'intégration ?**
   - Je recommande **Checkout** (le plus simple et sécurisé)
   - Pas besoin de certification PCI-DSS

2. **Quand activer le paiement ?**
   - Sur les factures uniquement ? (`document_type = 'facture'`)
   - Ou aussi sur les devis acceptés ?

3. **Gestion des montants :**
   - Les montants dans Bictorys sont en **centimes** (100 = 1 FCFA)
   - Il faut convertir les montants FCFA en centimes

4. **URLs de redirection :**
   - Succès : `/paiement/succes?charge_id=xxx`
   - Erreur : `/paiement/erreur?charge_id=xxx`

5. **Webhook URL :**
   - À configurer dans le tableau de bord Bictorys
   - Exemple : `https://votre-domaine.com/api/bictorys/webhook`

---

## 🚀 Prochaines étapes

Une fois que vous avez :
1. ✅ Créé un compte Bictorys
2. ✅ Obtenu vos clés API (Test)
3. ✅ Confirmé les questions ci-dessus

Je peux commencer l'implémentation complète avec :
- ✅ Code propre et sécurisé
- ✅ Interface utilisateur moderne
- ✅ Gestion des erreurs
- ✅ Validation des webhooks
- ✅ Notifications utilisateur

---

## 📚 Ressources

- [Documentation Bictorys](https://docs.bictorys.com/docs/comprendre-lapi-de-paiement)
- [API Reference - Create Charge](https://docs.bictorys.com/reference/createcharge)
- [Obtenir les clés API](https://docs.bictorys.com/reference/getting-started)
