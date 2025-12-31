# Test Bictorys API avec curl

## Test de la clé API

Exécutez cette commande dans PowerShell pour tester si votre clé API fonctionne :

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

Invoke-RestMethod -Uri "https://api.test.bictorys.com/pay/v1/charges" -Method Post -Headers $headers -Body $body
```

## Si curl fonctionne mais pas l'application

Le problème vient probablement du chargement des variables d'environnement. Vérifiez :
1. Le serveur est redémarré après modification de `.env.local`
2. Les variables sont bien chargées (vérifiez les logs serveur)

## Si curl retourne aussi 403

La clé API est invalide ou expirée. Vérifiez dans le dashboard Bictorys.
