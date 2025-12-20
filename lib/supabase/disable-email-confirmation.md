# Désactiver la confirmation d'email (pour le développement)

## Méthode 1 : Via le Dashboard Supabase (recommandé)

1. Va sur **https://supabase.com/dashboard**
2. Sélectionne ton projet (`mtborwdznqasahyageej`)
3. Clique sur **Authentication** (icône 🔐) dans la barre latérale
4. Clique sur **Settings** (⚙️)
5. Dans la section **Email Auth**, désactive **"Enable email confirmations"**
6. Clique sur **Save**

## Méthode 2 : Via SQL (si disponible)

```sql
-- Désactiver la confirmation d'email pour tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

**Note** : Cette commande confirme tous les emails existants, mais pour désactiver complètement la confirmation pour les nouveaux utilisateurs, utilise la Méthode 1.

