# 🔧 Configuration Bictorys

## ✅ Étapes de configuration

### 1. Ajouter les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Bictorys API (Test)
BICTORYS_API_KEY_PUBLIC=test_public-04933180-e92f-460b-95d5-cb5f7c6f6aa9.vTxNukljF4ibR3vBwS0BPj9gXk8sHrEEvZJVr3pyUxTW6jdGbxQZc4JbXIxPad5F
BICTORYS_API_KEY_SECRET=test_secret-04933180-e92f-460b-95d5-cb5f7c6f6aa9.ksEKFCO0R9MnKqxrHHfuPlY15YYC0r3juDVcfObYyhMMWBI116oeAbKIzMJZcsxU
BICTORYS_WEBHOOK_SECRET=whsec_xxxxx  # À obtenir depuis le dashboard Bictorys
BICTORYS_ENVIRONMENT=test
```

### 2. Créer la table payments dans Supabase

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez le script : `lib/supabase/CREATE_PAYMENTS_TABLE.sql`
3. Vérifiez que la table `payments` a été créée

### 3. Configurer le webhook dans Bictorys

1. Connectez-vous au [tableau de bord Bictorys](https://dashboard.bictorys.com)
2. Allez dans **Paramètres** → **Webhooks**
3. Ajoutez l'URL de votre webhook :
   ```
   https://votre-domaine.com/api/bictorys/webhook
   ```
   Pour le développement local, utilisez un service comme [ngrok](https://ngrok.com) :
   ```
   https://xxxxx.ngrok.io/api/bictorys/webhook
   ```
4. Copiez la clé secrète du webhook et ajoutez-la à `.env.local` :
   ```env
   BICTORYS_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 4. Tester l'intégration

1. **Créer une facture** (pas un devis)
2. Cliquer sur **"Payer en ligne"**
3. Choisir un mode de paiement
4. Tester avec les [cartes de test Bictorys](https://docs.bictorys.com/docs/test-vs-environment-direct)

---

## 📋 Fonctionnalités implémentées

✅ **Client API Bictorys** (`lib/bictorys/client.ts`)
- Création de charges
- Récupération des détails d'une charge
- Conversion FCFA ↔ centimes

✅ **API Routes**
- `/api/bictorys/create-charge` : Initier un paiement
- `/api/bictorys/webhook` : Recevoir les notifications Bictorys

✅ **Interface utilisateur**
- Bouton "Payer en ligne" sur les factures
- Modal de sélection du mode de paiement
- Pages de redirection (succès/erreur)

✅ **Base de données**
- Table `payments` pour stocker les transactions
- RLS activé

---

## 🔍 Dépannage

### Le bouton "Payer en ligne" n'apparaît pas

- Vérifiez que le document est une **facture** (`document_type = 'facture'`)
- Les devis n'ont pas de bouton de paiement

### Erreur "BICTORYS_API_KEY_PUBLIC is not set"

- Vérifiez que les variables d'environnement sont bien définies dans `.env.local`
- Redémarrez le serveur de développement après avoir ajouté les variables

### Le webhook ne fonctionne pas

- Vérifiez que l'URL du webhook est accessible publiquement
- Utilisez [ngrok](https://ngrok.com) pour le développement local
- Vérifiez les logs dans Supabase pour voir les erreurs

### Le paiement ne se redirige pas

- Vérifiez que `BICTORYS_ENVIRONMENT` est bien défini
- Vérifiez les logs de la console pour les erreurs
- Assurez-vous que les URLs de redirection sont correctes

---

## 🚀 Passage en production

1. **Obtenir les clés de production** depuis le dashboard Bictorys
2. **Mettre à jour les variables d'environnement** :
   ```env
   BICTORYS_ENVIRONMENT=production
   BICTORYS_API_KEY_PUBLIC=public-xxxxx-xxxxx
   BICTORYS_API_KEY_SECRET=secret-xxxxx-xxxxx
   ```
3. **Configurer le webhook de production** avec l'URL de votre domaine
4. **Tester** avec de petits montants avant de passer en production complète

---

## 📚 Documentation

- [Documentation Bictorys](https://docs.bictorys.com/docs/comprendre-lapi-de-paiement)
- [API Reference](https://docs.bictorys.com/reference/createcharge)
- [Cartes de test](https://docs.bictorys.com/docs/test-vs-environment-direct)
