# Changelog - DevisRapide

## [1.0.1] - Corrections Post-Build

### 🔧 Corrections

#### Migration Supabase Auth Helpers → Supabase SSR

**Problème** : Erreur de build `createMiddlewareClient doesn't exist`

**Cause** : La bibliothèque `@supabase/auth-helpers-nextjs` est obsolète avec Next.js 15+

**Solution** : Migration vers `@supabase/ssr` (nouvelle API officielle)

**Fichiers modifiés** :

1. **middleware.ts**
   - ✅ Utilise maintenant `createServerClient` de `@supabase/ssr`
   - ✅ Gestion manuelle des cookies pour le middleware

2. **lib/supabase/client.ts**
   - ✅ Utilise `createBrowserClient` au lieu de `createClientComponentClient`
   - ✅ Configuration directe avec les variables d'environnement

3. **lib/supabase/server.ts**
   - ✅ Utilise `createServerClient` au lieu de `createServerComponentClient`
   - ✅ Gestion des cookies avec la nouvelle API

4. **package.json**
   - ✅ Ajouté : `@supabase/ssr`
   - ✅ Supprimé : `@supabase/auth-helpers-nextjs`

### 📦 Nouveaux packages

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.5.2"
  }
}
```

### 🔄 Compatibilité

- ✅ Next.js 16.1.0
- ✅ React 19.2.3
- ✅ Supabase JS v2.88.0

### 📖 Documentation mise à jour

Aucune modification de documentation nécessaire car l'API reste identique pour l'utilisateur final.

## [1.0.0] - Version Initiale

### ✨ Fonctionnalités MVP

- ✅ Authentification complète
- ✅ Profil entreprise avec upload logo
- ✅ Gestion clients (CRUD)
- ✅ Catalogue produits (100+ templates)
- ✅ Création de devis
- ✅ Dashboard statistiques
- ✅ Système freemium
- ✅ Génération PDF
- ✅ Envoi WhatsApp
- ✅ PWA configuration
- ✅ UI/UX responsive

---

## Notes de migration (pour développeurs)

### Si vous avez déjà déployé la version 1.0.0

**Pas d'action requise** - Les changements sont rétrocompatibles.

Si vous rencontrez des erreurs de build :

```bash
# 1. Mettre à jour les dépendances
npm install @supabase/ssr
npm uninstall @supabase/auth-helpers-nextjs

# 2. Vérifier que les fichiers suivants sont à jour :
# - middleware.ts
# - lib/supabase/client.ts
# - lib/supabase/server.ts

# 3. Rebuild
npm run build
```

### Variables d'environnement

Aucun changement - les mêmes variables sont utilisées :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

**Dernière mise à jour** : 19 Décembre 2024

