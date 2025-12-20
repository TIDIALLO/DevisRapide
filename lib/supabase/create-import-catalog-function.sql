-- Fonction pour importer le catalogue (contourne RLS)
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.import_catalog_items(
  p_user_id UUID,
  p_items JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  inserted_count INTEGER := 0;
BEGIN
  -- Parcourir chaque item et l'insérer
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.catalog_items (
      user_id,
      name,
      description,
      unit_price,
      unit,
      category,
      is_template
    )
    VALUES (
      p_user_id,
      item->>'name',
      NULLIF(item->>'description', 'null'),
      (item->>'unit_price')::DECIMAL(15, 2),
      item->>'unit',
      NULLIF(item->>'category', 'null'),
      COALESCE((item->>'is_template')::BOOLEAN, FALSE)
    )
    ON CONFLICT DO NOTHING;
    
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN inserted_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.import_catalog_items TO authenticated, anon;

