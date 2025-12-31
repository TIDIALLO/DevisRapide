# 🔧 Correction : Erreur 403 Forbidden Bictorys

## ❌ Problème
Erreur `403 Forbidden` lors de l'appel à l'API Bictorys.

## 🔍 Causes possibles

### 1. Clé API non chargée (le plus probable)

**Symptôme** : Erreur 403 immédiate

**Solution** :
1. Vérifiez que `.env.local` contient bien :
   ```env
   BICTORYS_API_KEY_PUBLIC=test_public-04933180-e92f-460b-95d5-cb5f7c6f6aa9.vTxNukljF4ibR3vBwS0BPj9gXk8sHrEEvZJVr3pyUxTW6jdGbxQZc4JbXIxPad5F
   BICTORYS_ENVIRONMENT=test
   ```

2. **REDÉMARREZ le serveur** (obligatoire) :
   ```bash
   # Arrêtez (Ctrl+C)
   npm run dev
   ```

3. Vérifiez les logs serveur - vous devriez voir :
   ```
   [Upgrade] Variables d'environnement: { hasApiKey: true, environment: 'test', ... }
   ```

### 2. Clé API invalide ou expirée

**Symptôme** : Erreur 403 même après redémarrage

**Solution** :
1. Connectez-vous au [dashboard Bictorys](https://dashboard.bictorys.com)
2. Vérifiez que votre clé API est **active**
3. Si nécessaire, régénérez une nouvelle clé
4. Mettez à jour `.env.local` avec la nouvelle clé
5. Redémarrez le serveur

### 3. Format de la clé incorrect

**Vérifications** :
- La clé doit commencer par `test_public-` pour l'environnement de test
- Pas d'espaces avant/après le `=` dans `.env.local`
- Pas de guillemets autour de la valeur

**Exemple correct** :
```env
BICTORYS_API_KEY_PUBLIC=test_public-04933180-e92f-460b-95d5-cb5f7c6f6aa9.vTxNukljF4ibR3vBwS0BPj9gXk8sHrEEvZJVr3pyUxTW6jdGbxQZc4JbXIxPad5F
```

**Exemple incorrect** :
```env
BICTORYS_API_KEY_PUBLIC="test_public-..."  # ❌ Pas de guillemets
BICTORYS_API_KEY_PUBLIC = test_public-...  # ❌ Pas d'espaces autour du =
```

### 4. URL de l'API incorrecte

**Vérification** :
- Pour le test : `https://api.test.bictorys.com`
- Pour la production : `https://api.bictorys.com`
- Vérifiez que `BICTORYS_ENVIRONMENT=test` est bien défini

## 🧪 Test manuel de l'API

Testez directement avec curl pour vérifier que la clé fonctionne :

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

**Si curl fonctionne mais pas l'application** :
- Le problème vient du chargement des variables d'environnement
- Redémarrez le serveur

**Si curl retourne aussi 403** :
- La clé API est invalide ou expirée
- Contactez le support Bictorys ou régénérez la clé

## 📋 Checklist de diagnostic

- [ ] `.env.local` existe et contient `BICTORYS_API_KEY_PUBLIC`
- [ ] Pas d'espaces autour du `=` dans `.env.local`
- [ ] Pas de guillemets autour de la valeur
- [ ] `BICTORYS_ENVIRONMENT=test` est défini
- [ ] Serveur redémarré après modification de `.env.local`
- [ ] Logs serveur montrent `hasApiKey: true`
- [ ] Clé API active dans le dashboard Bictorys

## 🔧 Corrections apportées

✅ **Gestion d'erreur améliorée** :
- Messages d'erreur spécifiques pour 403
- Logs détaillés pour diagnostic
- Vérification que la clé est chargée avant l'appel API

✅ **Logs de diagnostic** :
- Affiche si la clé est chargée
- Affiche l'URL appelée
- Affiche les paramètres de la requête

## 🚀 Prochaines étapes

1. **Vérifiez les logs serveur** après redémarrage
2. **Testez avec curl** pour vérifier la clé
3. **Si l'erreur persiste**, partagez les logs serveur complets
