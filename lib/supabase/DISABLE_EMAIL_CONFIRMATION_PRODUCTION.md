# 🔧 Désactiver la confirmation d'email en PRODUCTION

## ⚠️ Problème

En production, les utilisateurs ne reçoivent pas les emails de confirmation et ne peuvent pas se connecter.

## ✅ Solution : Désactiver la confirmation d'email

### Étape 1 : Aller dans les paramètres Supabase

1. **Ouvrir** : https://supabase.com/dashboard/project/mtborwdznqasahyageej/settings/auth

2. **Scroller** jusqu'à la section **"Email Auth"**

3. **Désactiver** l'option **"Enable email confirmations"**

4. **Cliquer sur "Save"**

### Étape 2 : Confirmer tous les emails existants (optionnel)

Si vous avez déjà des utilisateurs non confirmés, exécutez ce script SQL :

```sql
-- Confirmer tous les emails non confirmés
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

**Où exécuter** : https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql/new

### Étape 3 : Vérifier

1. **Tester la création d'un compte** en production
2. **Tester la connexion** immédiatement après
3. Ça devrait fonctionner sans confirmation d'email

## 📋 Résultat attendu

Après avoir désactivé la confirmation d'email :
- ✅ Les nouveaux utilisateurs peuvent se connecter immédiatement
- ✅ Plus besoin d'attendre l'email de confirmation
- ✅ Les utilisateurs existants non confirmés peuvent se connecter (après avoir exécuté le script SQL)

## ⚠️ Note de sécurité

Désactiver la confirmation d'email réduit la sécurité. Assurez-vous que :
- Les mots de passe sont suffisamment forts
- Vous avez d'autres mesures de sécurité en place
- Pour une application de production importante, considérez d'utiliser un service d'email SMTP configuré

