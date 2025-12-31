# ✅ Modifications : Logo et Type de Document (Devis/Facture)

## 📋 Résumé des changements

Cette mise à jour ajoute :
1. **Affichage du logo** sur les devis/factures PDF
2. **Distinction Devis/Facture** avec sélection dans le formulaire
3. **Description du service fourni** (ex: "Création d'une application web")

## 🗄️ Étape 1 : Mise à jour de la base de données

**⚠️ IMPORTANT : Exécutez ce script SQL dans votre Supabase Dashboard**

1. Allez dans **Supabase Dashboard → SQL Editor**
2. Ouvrez le fichier `lib/supabase/ADD_DOCUMENT_TYPE_AND_SERVICE.sql`
3. Copiez-collez le contenu dans l'éditeur SQL
4. Cliquez sur **Run** pour exécuter

Ce script ajoute :
- `document_type` : colonne pour distinguer "devis" ou "facture" (défaut: "devis")
- `service_description` : colonne pour décrire le service fourni

## 📝 Étape 2 : Modifications du code

### Fichiers modifiés :

1. **`types/database.ts`**
   - Ajout de `document_type` et `service_description` dans les types `Row`, `Insert`, et `Update`

2. **`app/(app)/devis/nouveau/page.tsx`**
   - Ajout du champ de sélection "Type de document" (Devis/Facture)
   - Ajout du champ "Service fourni" avec placeholder explicatif
   - Mise à jour de la fonction `createQuote` pour inclure ces champs
   - Adaptation des labels selon le type de document

3. **`lib/pdf/quote-pdf.tsx`**
   - **Affichage du logo** : Le logo de l'entreprise s'affiche maintenant dans le header du PDF
   - **Titre du document** : Affichage de "DEVIS" ou "FACTURE" en grand titre
   - **Service fourni** : Affichage de la description du service sous le titre
   - Adaptation des labels selon le type de document

4. **`app/(app)/devis/[id]/page.tsx`**
   - Affichage du type de document et du service sur la page de détail
   - Adaptation des labels selon le type de document

## 🎨 Fonctionnalités

### Formulaire de création
- **Type de document** : Sélection entre "Devis (avant service)" et "Facture (après service)"
- **Service fourni** : Champ texte pour décrire le service (ex: "Création d'une application web", "Peinture d'une maison", etc.)
- Les labels s'adaptent automatiquement selon le type sélectionné

### PDF généré
- **Logo** : Le logo de l'entreprise (si uploadé dans le profil) apparaît en haut à droite
- **Titre** : "DEVIS" ou "FACTURE" en grand titre bleu
- **Service** : Description du service affichée sous le titre
- **Labels adaptatifs** : "Devis pour" / "Facturé à", "Valable jusqu'au" / "Échéance"

## ✅ Vérification

Après avoir exécuté le script SQL :

1. Créez un nouveau devis/facture
2. Sélectionnez le type de document
3. Remplissez la description du service
4. Générez le PDF
5. Vérifiez que :
   - Le logo apparaît (si vous avez un logo dans votre profil)
   - Le titre "DEVIS" ou "FACTURE" s'affiche
   - La description du service apparaît
   - Les labels sont corrects selon le type

## 🔧 Notes techniques

- Le logo doit être uploadé dans **Profil → Logo** pour apparaître sur les PDF
- Le type de document par défaut est "devis" pour les anciens devis
- Le champ "Service fourni" est optionnel mais recommandé pour la clarté

