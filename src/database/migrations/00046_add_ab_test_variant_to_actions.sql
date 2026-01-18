-- =========================================================================
-- ADD AB TEST VARIANT TO ACTIONS TABLE
-- Data: 2026-01-18
-- Descrizione: Aggiunge colonna ab_test_variant per tracciare varianti A/B test
-- =========================================================================

-- Aggiungere colonna ab_test_variant
ALTER TABLE actions 
ADD COLUMN ab_test_variant TEXT;

-- Aggiungere commento alla colonna
COMMENT ON COLUMN actions.ab_test_variant IS 'A/B test variant shown to user (e.g., hero_test_control, hero_test_variant). Format: {test_name}_{variant}';

-- Verifica migrazione
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'actions' 
AND column_name = 'ab_test_variant';
