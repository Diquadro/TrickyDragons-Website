-- =========================================================================
-- ADD E-COMMERCE EVENTS TO ANALYTICS_EVENT_NAME ENUM
-- Data: 2026-01-18
-- Descrizione: Aggiunge eventi add_to_cart e purchase all'enum analytics_event_name
-- =========================================================================

-- Aggiungere nuovi valori all'enum analytics_event_name
ALTER TYPE analytics_event_name ADD VALUE IF NOT EXISTS 'add_to_cart';
ALTER TYPE analytics_event_name ADD VALUE IF NOT EXISTS 'purchase';

-- Verifica dei nuovi valori
SELECT 
    enumlabel as event_name
FROM pg_enum
WHERE enumtypid = 'analytics_event_name'::regtype
ORDER BY enumsortorder;
