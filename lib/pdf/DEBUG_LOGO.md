# 🔍 Debug : Logo ne s'affiche pas dans le PDF

## Problème

Le logo ne s'affiche pas dans le PDF alors que la signature fonctionne correctement.

## Vérifications à faire

### 1. Vérifier que le logo est uploadé dans le profil

1. Allez dans **Profil** dans l'application
2. Vérifiez qu'un logo est bien uploadé
3. Vérifiez que le logo s'affiche dans la page de profil

### 2. Vérifier l'URL du logo dans la base de données

Exécutez cette requête SQL dans Supabase SQL Editor :

```sql
SELECT 
  id,
  email,
  logo_url,
  signature_url,
  CASE 
    WHEN logo_url IS NULL THEN '❌ Logo non uploadé'
    WHEN logo_url = '' THEN '❌ Logo URL vide'
    WHEN logo_url NOT LIKE 'https://%' THEN '⚠️ Logo URL invalide (doit commencer par https://)'
    ELSE '✅ Logo URL valide'
  END as logo_status
FROM users
WHERE id = 'VOTRE_USER_ID';
```

### 3. Tester l'URL du logo directement

1. Copiez l'URL du logo depuis la base de données
2. Collez-la dans un navigateur
3. Vérifiez que l'image s'affiche correctement

### 4. Vérifier les logs de la console

Lors de la génération du PDF, ouvrez la console du navigateur (F12) et cherchez les logs :
- `[PDF Debug] Logo URL validée:`
- `[PDF Debug] Profile logo_url brut:`

Ces logs indiqueront si :
- Le logo_url est null
- L'URL n'est pas valide
- L'URL est bien passée au composant PDF

## Solutions possibles

### Solution 1 : Le logo n'est pas uploadé

Si `logo_url` est `null` dans la base de données :
1. Allez dans **Profil**
2. Uploadez un logo
3. Sauvegardez
4. Régénérez le PDF

### Solution 2 : L'URL n'est pas valide

Si l'URL ne commence pas par `https://` :
1. Vérifiez que le bucket `logos` est **PUBLIC** dans Supabase
2. Vérifiez que l'URL générée par Supabase est correcte
3. Ré-uploadez le logo si nécessaire

### Solution 3 : Problème avec @react-pdf/renderer

Si l'URL est valide mais l'image ne s'affiche toujours pas :
- `@react-pdf/renderer` peut avoir des problèmes avec certaines URLs
- Essayez de télécharger l'image et de la convertir en base64
- Ou utilisez une URL signée Supabase si le bucket est privé

## Test rapide

Pour vérifier rapidement si le problème vient du logo ou du code :

1. Ouvrez la console du navigateur (F12)
2. Générez un PDF
3. Regardez les logs `[PDF Debug]`
4. Vérifiez si `Logo URL validée` est `null` ou contient une URL

Si `Logo URL validée` est `null`, le problème vient de l'URL du logo dans la base de données.
Si `Logo URL validée` contient une URL valide, le problème vient de `@react-pdf/renderer`.

