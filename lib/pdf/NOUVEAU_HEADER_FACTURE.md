# ✅ Nouveau design de l'en-tête facture/devis

## 🎯 Modifications apportées

### 1. Structure de l'en-tête réorganisée

**Nouvelle disposition** :
```
┌─────────────────────────────────────────────┐
│ [LOGO]  Nom entreprise          [FACTURE]  │
│         Adresse                             │
│         Tél: ...                            │
│         Email: ...                          │
│         NINEA: ...                          │
└─────────────────────────────────────────────┘
```

**Détails** :
- **Logo à gauche** : 70x70px, aligné avec les informations
- **Informations entreprise** : Affichées ligne par ligne à côté du logo
  - Nom de l'entreprise (gras)
  - Adresse
  - Téléphone
  - Email
  - NINEA
- **"FACTURE" ou "DEVIS"** : En haut à droite, titre en grand (20px, bleu)
- **Service fourni** : Sous le titre, en italique, aligné à droite

### 2. Signature corrigée et repositionnée

**Avant** :
- Validation d'URL manquante
- Position non optimale

**Après** :
- **Validation de l'URL** : Utilise la même fonction `getValidLogoUrl()` que pour le logo
- **Position** : En bas à droite du document
- **Style** : 
  - Label "Signature" en gras
  - Image avec bordure en bas
  - Nom du signataire en dessous
  - Largeur : 180px, aligné à droite

### 3. Correction du fichier SQL

**Problème** :
- PostgreSQL ne permet pas d'utiliser `ADD COLUMN IF NOT EXISTS` avec une contrainte `CHECK` dans la même commande

**Solution** :
- Utilisation de blocs `DO $$` pour vérifier l'existence des colonnes avant de les ajouter
- Séparation de l'ajout de colonne et de la contrainte CHECK
- Script maintenant compatible avec PostgreSQL

## 📐 Structure finale complète

```
┌─────────────────────────────────────────────┐
│ [LOGO]  NOM ENTREPRISE        [FACTURE]     │
│ 70x70   Adresse                             │
│         Tél: +221 XX XXX XX XX              │
│         Email: contact@example.com          │
│         NINEA: SN-XXX-XXXXX                 │
│         Service: Création application web   │
├─────────────────────────────────────────────┤
│ ... contenu du devis/facture ...            │
├─────────────────────────────────────────────┤
│                                             │
│                          [Signature]        │
│                          ─────────          │
│                          Nom signataire    │
└─────────────────────────────────────────────┘
```

## 🔧 Détails techniques

### Styles modifiés

1. **`headerLeft`** : 
   - Changé de `flex: 1` à `flexDirection: 'row'` avec `gap: 12`
   - Contient maintenant logo + informations

2. **`logoContainer`** : 
   - Nouveau style : 70x70px
   - Aligné à gauche

3. **`companyInfoContainer`** : 
   - Nouveau style : contient toutes les infos entreprise
   - Affichage ligne par ligne

4. **`documentTypeTitle`** : 
   - Taille : 20px (au lieu de 14px)
   - Aligné à droite
   - Couleur bleue (#2563eb)

5. **`signatureSection`** : 
   - `justifyContent: 'flex-end'` (au lieu de 'space-between')
   - Aligné à droite uniquement

6. **`signatureImage`** : 
   - Bordure en bas pour séparer visuellement
   - Taille optimisée : 140x50px

### Validation des URLs

**Fonction `getValidLogoUrl()`** :
- Nettoie l'URL (supprime les espaces)
- Valide le format (http/https)
- Gère les URLs relatives
- Retourne `null` si invalide (évite les erreurs)

**Utilisée pour** :
- Logo de l'entreprise
- Signature (via `getValidLogoUrl(profile.signature_url)`)

## ✅ Résultat

- **En-tête professionnel** : Logo + infos à gauche, type de document à droite
- **Signature fonctionnelle** : Validation d'URL + position optimale
- **SQL corrigé** : Script compatible avec PostgreSQL
- **Espace optimisé** : Structure compacte et lisible

## 🐛 Dépannage

### Si le logo ne s'affiche pas :
1. Vérifier que le bucket `logos` est public dans Supabase
2. Vérifier l'URL dans la base de données
3. Tester l'URL directement dans un navigateur

### Si la signature ne s'affiche pas :
1. Vérifier que la signature est uploadée dans le profil
2. Vérifier que l'URL `signature_url` est valide dans la base de données
3. Utiliser la même méthode que pour le logo

### Si le script SQL échoue :
1. Vérifier que vous êtes dans Supabase SQL Editor
2. Exécuter le script section par section si nécessaire
3. Vérifier que la table `quotes` existe

