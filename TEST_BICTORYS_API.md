# 🧪 Test de l'API Bictorys

## Test manuel avec curl

Pour vérifier que votre clé API fonctionne, testez avec curl :

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

## Erreur 403 : Causes possibles

### 1. Clé API invalide ou expirée
- Vérifiez dans le dashboard Bictorys que la clé est active
- Régénérez la clé si nécessaire

### 2. Format de la clé incorrect
- La clé doit commencer par `test_public-` pour l'environnement de test
- Vérifiez qu'il n'y a pas d'espaces avant/après dans `.env.local`

### 3. Environnement incorrect
- Vérifiez que `BICTORYS_ENVIRONMENT=test` est bien défini
- L'URL doit être `https://api.test.bictorys.com` pour le test

### 4. Serveur non redémarré
- **OBLIGATOIRE** : Redémarrez le serveur après modification de `.env.local`

## Vérification

1. **Vérifiez les logs serveur** - Vous devriez voir :
   ```
   [Bictorys] Création charge: { url: '...', apiKeyPrefix: 'test_public-04933180...', hasApiKey: true }
   ```

2. **Si `hasApiKey: false`** → La clé n'est pas chargée, redémarrez le serveur

3. **Si l'erreur 403 persiste** → La clé est peut-être invalide, vérifiez dans le dashboard Bictorys
