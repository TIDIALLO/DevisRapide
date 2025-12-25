# 🚨 URGENT : Exécuter le script SQL pour corriger l'erreur RLS

## ❌ Erreur actuelle

```
code: "42501"
message: "new row violates row-level security policy for table \"quotes\""
```

**Cette erreur signifie que les politiques RLS ne sont PAS configurées dans Supabase.**

## ✅ SOLUTION : Exécuter le script SQL

### Étape 1 : Ouvrir Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Se connecter à votre compte
3. Sélectionner votre projet

### Étape 2 : Ouvrir SQL Editor

1. Dans le menu de gauche, cliquer sur **"SQL Editor"**
2. Cliquer sur **"New query"** (ou utiliser un onglet existant)

### Étape 3 : Copier le script SQL

1. Ouvrir le fichier : `lib/supabase/FIX_QUOTES_RLS_DEFINITIVE.sql`
2. **Sélectionner TOUT le contenu** (Ctrl+A)
3. **Copier** (Ctrl+C)

### Étape 4 : Coller et exécuter

1. Dans SQL Editor de Supabase, **coller** le script (Ctrl+V)
2. Cliquer sur le bouton **"Run"** (ou appuyer sur F5)
3. **ATTENDRE** que l'exécution se termine
4. Vérifier qu'il n'y a **AUCUNE erreur rouge**

### Étape 5 : Vérifier les résultats

Le script doit afficher :
- ✅ Des politiques créées (8 au total)
- ✅ Des privilèges accordés
- ✅ La fonction generate_quote_number créée

### Étape 6 : Se déconnecter et se reconnecter

**⚠️ OBLIGATOIRE après avoir exécuté le script**

1. Dans l'application, **se déconnecter**
2. **Se reconnecter** avec votre email et mot de passe
3. **Tester** la création d'un devis

## 🔍 Vérification que ça a fonctionné

Exécuter cette requête dans SQL Editor :

```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('quotes', 'quote_items')
ORDER BY tablename, policyname;
```

**Résultat attendu : 8 politiques**
- 4 pour `quotes` (SELECT, INSERT, UPDATE, DELETE)
- 4 pour `quote_items` (SELECT, INSERT, UPDATE, DELETE)

## ⚠️ Si l'erreur persiste

1. Vérifier que le script a été exécuté **sans erreur**
2. Vérifier que les 8 politiques existent (voir ci-dessus)
3. Se déconnecter et se reconnecter
4. Vider le cache du navigateur (Ctrl+Shift+Delete)
5. Réessayer

## 📝 Note importante

**Sans exécuter ce script SQL, l'erreur RLS continuera à apparaître.** 
Le code de l'application ne peut pas créer les politiques RLS - cela doit être fait dans Supabase Dashboard.

