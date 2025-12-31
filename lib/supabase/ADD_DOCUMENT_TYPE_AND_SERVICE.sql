-- Ajouter les colonnes document_type et service_description à la table quotes
-- IMPORTANT : Exécuter ce script dans Supabase SQL Editor

-- 1. Ajouter document_type (devis ou facture)
-- Note: On ne peut pas utiliser IF NOT EXISTS avec CHECK, donc on vérifie d'abord
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE quotes ADD COLUMN document_type TEXT DEFAULT 'devis';
    ALTER TABLE quotes ADD CONSTRAINT quotes_document_type_check 
      CHECK (document_type IN ('devis', 'facture'));
  END IF;
END $$;

-- 2. Ajouter service_description (description du service fourni)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'service_description'
  ) THEN
    ALTER TABLE quotes ADD COLUMN service_description TEXT;
  END IF;
END $$;

-- Commentaire pour clarifier l'usage
COMMENT ON COLUMN quotes.document_type IS 'Type de document: devis (avant service) ou facture (après service)';
COMMENT ON COLUMN quotes.service_description IS 'Description du service fourni (ex: Création d''une application web, Peinture d''une maison, etc.)';

-- Mettre à jour les quotes existantes pour avoir document_type = 'devis' par défaut
UPDATE quotes SET document_type = 'devis' WHERE document_type IS NULL;

