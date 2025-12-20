# DevisRapide 🚀

Application web progressive (PWA) pour créer et envoyer des devis professionnels en moins de 3 minutes. Conçue pour les artisans sénégalais.

## 🎯 Fonctionnalités MVP

### ✅ Authentification
- Inscription rapide (< 60 secondes)
- Connexion sécurisée
- Session persistante (30 jours)

### ✅ Profil Entreprise
- Informations professionnelles
- Upload de logo
- Conditions de paiement par défaut
- Numéro NINEA

### ✅ Gestion Clients
- Ajouter/Modifier/Supprimer des clients
- Recherche rapide
- Historique des devis par client

### ✅ Catalogue de Produits/Services
- Catalogue personnalisable
- Templates pré-remplis par métier (peintre, mécanicien, etc.)
- Recherche et filtres par catégorie
- Duplication d'articles

### ✅ Création de Devis
- Interface intuitive en 4 étapes
- Ajout d'articles depuis le catalogue ou custom
- Calculs automatiques (remise, TVA)
- Sauvegarde brouillon
- Preview en temps réel

### ✅ Gestion des Devis
- Liste complète avec filtres
- Statuts : Brouillon, Envoyé, Accepté, Refusé, Expiré
- Duplication de devis
- Envoi WhatsApp direct

### ✅ Dashboard
- Statistiques du mois
- Devis récents
- Taux d'acceptation
- Montants totaux

### ✅ Système Freemium
- **Plan Gratuit** : 5 devis/mois, 20 articles, 10 clients
- **Plan PRO (5,000 FCFA/mois)** : Illimité + sans watermark

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router), React 19, TypeScript
- **UI** : Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **PDF** : @react-pdf/renderer
- **Dates** : date-fns
- **Forms** : React Hook Form + Zod
- **Déploiement** : Vercel

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- Compte Supabase (gratuit)

### 1. Cloner et installer

```bash
cd devisrapide
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le schéma SQL :
   - Allez dans SQL Editor
   - Copiez le contenu de `lib/supabase/schema.sql`
   - Exécutez le script

3. Créez un bucket de storage nommé `logos` :
   - Allez dans Storage
   - Créez un nouveau bucket public nommé `logos`

4. Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

### 3. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🚀 Déploiement sur Vercel

### Méthode 1 : Via GitHub

1. Poussez votre code sur GitHub
2. Connectez-vous sur [vercel.com](https://vercel.com)
3. Importez votre repository
4. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Déployez !

### Méthode 2 : Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 📱 PWA (Progressive Web App)

L'application est installable sur mobile et desktop :

- **Android** : "Ajouter à l'écran d'accueil"
- **iOS** : Safari > Partager > "Sur l'écran d'accueil"
- **Desktop** : Icône d'installation dans la barre d'adresse

## 🎨 Personnalisation

### Couleurs (Tailwind)
Modifiez `tailwind.config.ts` pour changer la palette de couleurs.

### Templates Catalogue
Ajoutez/modifiez les templates dans `lib/templates/catalog-templates.ts`

### Limites Freemium
Ajustez les limites dans `types/index.ts` (PLAN_LIMITS)

## 📊 Base de données

### Tables principales
- `users` : Profils utilisateurs
- `clients` : Clients des artisans
- `catalog_items` : Articles/services
- `quotes` : Devis
- `quote_items` : Lignes de devis

### Sécurité
- Row Level Security (RLS) activé sur toutes les tables
- Chaque utilisateur accède uniquement à ses données

## 🔐 Sécurité

- Authentification JWT via Supabase
- HTTPS obligatoire en production
- RLS sur toutes les tables
- Validation des données côté serveur

## 📈 Métriques de succès (MVP)

- **Acquisition** : 50 utilisateurs inscrits
- **Activation** : 60% créent leur 1er devis
- **Rétention** : 40% reviennent à J+7
- **Revenue** : 15-20 utilisateurs PRO (75,000 FCFA MRR)

## 🗺️ Roadmap

### Phase 1 : MVP ✅ (Semaines 1-3)
- Toutes les fonctionnalités de base

### Phase 2 : Amélioration (Mois 2-3)
- Templates PDF multiples
- Mode offline complet
- Export Excel
- Notifications email/SMS

### Phase 3 : Croissance (Mois 4-6)
- Conversion devis → facture
- Suivi paiements
- Multi-utilisateurs
- App mobile native

## 🐛 Debugging

### Problèmes courants

**Erreur de connexion Supabase**
- Vérifiez vos variables d'environnement
- Assurez-vous que le schéma SQL est bien exécuté

**Upload de logo ne fonctionne pas**
- Vérifiez que le bucket `logos` existe et est public

**Erreur de build**
- Supprimez `.next` et `node_modules`
- Réinstallez : `npm install`
- Rebuild : `npm run build`

## 📝 Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter
```

## 🤝 Support

Pour toute question ou problème :
- Email : support@devisrapide.sn
- WhatsApp : +221 XX XXX XX XX

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Fait avec ❤️ pour les artisans sénégalais**
