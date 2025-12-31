# 🔍 Diagnostic Erreur 403 Bictorys

## ✅ Corrections déjà appliquées

1. **Header API** : `X-Api-Key` → `X-API-Key` (majuscules) ✅
2. **Format Wave** : `wave` → `wave_money` ✅
3. **Logs améliorés** : Affichage de la réponse complète de Bictorys ✅

## 🔍 Prochaines étapes de diagnostic

### 1. Vérifier les logs serveur

Après avoir redémarré le serveur, cherchez dans les logs :

```
[Bictorys] Réponse reçue: { status: 403, ... }
[Bictorys] Réponse non-JSON complète: ...
```

Cela vous dira exactement ce que Bictorys retourne.

### 2. Tester avec curl

Exécutez cette commande PowerShell pour tester directement :

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "test_public-04933180-e92f-460b-95d5-cb5f7c6f6aa9.vTxNukljF4ibR3vBwS0BPj9gXk8sHrEEvZJVr3pyUxTW6jdGbxQZc4JbXIxPad5F"
    "Accept" = "application/json"
}

$body = @{
    amount = 500000
    currency = "XOF"
    country = "SN"
    successRedirectUrl = "https://example.com/success"
    errorRedirectUrl = "https://example.com/error"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.test.bictorys.com/pay/v1/charges" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Succès:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}
```

### 3. Si curl fonctionne mais pas l'application

- Le problème vient du chargement des variables d'environnement
- **Redémarrez le serveur** après modification de `.env.local`
- Vérifiez que les logs montrent `hasApiKey: true`

### 4. Si curl retourne aussi 403

La clé API est invalide ou expirée. Options :

1. **Vérifier dans le dashboard Bictorys** :
   - Connectez-vous à https://dashboard.bictorys.com
   - Allez dans **Développeurs** → **Configuration des clés API**
   - Vérifiez que la clé est **active**
   - Régénérez une nouvelle clé si nécessaire

2. **Vérifier l'environnement** :
   - Assurez-vous que `BICTORYS_ENVIRONMENT=test` est bien défini
   - L'URL doit être `https://api.test.bictorys.com` pour le test

3. **Vérifier le format de la clé** :
   - La clé doit commencer par `test_public-` pour l'environnement de test
   - Pas d'espaces avant/après le `=` dans `.env.local`
   - Pas de guillemets autour de la valeur

## 📋 Checklist

- [ ] Serveur redémarré après modification de `.env.local`
- [ ] Logs serveur montrent `hasApiKey: true`
- [ ] Test curl exécuté
- [ ] Clé API vérifiée dans le dashboard Bictorys
- [ ] `BICTORYS_ENVIRONMENT=test` est défini
- [ ] Format de la clé correct (pas d'espaces, pas de guillemets)

## 🔧 Logs à vérifier

Après une tentative de paiement, cherchez dans les logs serveur :

1. `[Bictorys] Création charge:` - Vérifie que la requête est bien formée
2. `[Bictorys] Réponse reçue:` - Affiche la réponse complète de Bictorys
3. `[Bictorys] Réponse non-JSON complète:` - Si la réponse n'est pas JSON, affiche le contenu

Ces logs vous diront exactement ce que Bictorys retourne et pourquoi il refuse la requête.
