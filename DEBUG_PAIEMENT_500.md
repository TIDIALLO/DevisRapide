# 🔍 Debug : Erreur 500 lors du paiement

## Problème
Erreur 500 lors de la création d'une charge de paiement (upgrade PRO ou facture).

## ✅ Corrections apportées

### 1. Gestion d'erreur améliorée
- Messages d'erreur plus détaillés
- Logs dans la console serveur
- Gestion gracieuse des erreurs de base de données

### 2. Vérification de la clé API
- La clé API est maintenant vérifiée au moment de l'appel, pas au chargement du module
- Message d'erreur clair si la clé est manquante

## 🔧 Vérifications à faire

### 1. Vérifier les variables d'environnement

Assurez-vous que `.env.local` contient :

```env
BICTORYS_API_KEY_PUBLIC=test_public-04933180-e92f-460b-95d5-cb5f7c6f6aa9.vTxNukljF4ibR3vBwS0BPj9gXk8sHrEEvZJVr3pyUxTW6jdGbxQZc4JbXIxPad5F
BICTORYS_API_KEY_SECRET=test_secret-04933180-e92f-460b-95d5-cb5f7c6f6aa9.ksEKFCO0R9MnKqxrHHfuPlY15YYC0r3juDVcfObYyhMMWBI116oeAbKIzMJZcsxU
BICTORYS_ENVIRONMENT=test
```

**Important** : Redémarrez le serveur après avoir modifié `.env.local` :
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### 2. Vérifier que la table payments existe

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez :
```sql
SELECT * FROM payments LIMIT 1;
```

Si vous obtenez une erreur "relation does not exist", exécutez :
```sql
-- Exécutez le script
-- lib/supabase/CREATE_PAYMENTS_TABLE.sql
```

### 3. Vérifier les logs serveur

Ouvrez la console où tourne `npm run dev` et regardez les erreurs détaillées.

Les erreurs possibles :
- `BICTORYS_API_KEY_PUBLIC is not set` → Vérifiez `.env.local`
- `relation "payments" does not exist` → Créez la table
- `Erreur Bictorys: ...` → Problème avec l'API Bictorys

### 4. Tester l'API Bictorys directement

Vous pouvez tester avec curl :

```bash
curl -X POST https://api.test.bictorys.com/pay/v1/charges \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: test_public-04933180-e92f-460b-95d5-cb5f7c6f6aa9.vTxNukljF4ibR3vBwS0BPj9gXk8sHrEEvZJVr3pyUxTW6jdGbxQZc4JbXIxPad5F" \
  -d '{
    "amount": 500000,
    "currency": "XOF",
    "country": "SN",
    "successRedirectUrl": "https://example.com/success",
    "errorRedirectUrl": "https://example.com/error"
  }'
```

## 🎨 Améliorations du modal de paiement

### Design moderne et professionnel
- ✅ Logos SVG pour Orange Money et Wave (pas de dépendance externe)
- ✅ Design avec gradients et animations
- ✅ Effets hover et transitions fluides
- ✅ Affichage du montant mis en évidence
- ✅ Indicateur de sécurité visible

### Logos officiels
- Orange Money : Logo SVG orange avec symbole
- Wave : Logo SVG violet avec symbole
- Carte bancaire : Icône générique (peut être amélioré avec logos Visa/Mastercard)

## 📝 Prochaines étapes

1. **Vérifiez les variables d'environnement** et redémarrez le serveur
2. **Créez la table payments** si elle n'existe pas
3. **Testez à nouveau** le paiement
4. **Consultez les logs** dans la console serveur pour plus de détails

Si l'erreur persiste, partagez les logs de la console serveur pour un diagnostic plus précis.
