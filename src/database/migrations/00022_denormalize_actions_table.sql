-- =========================================================================
-- MIGRAZIONE DENORMALIZZAZIONE TRICKYDRAGON DB
-- Data: 2025-06-01
-- Descrizione: Denormalizza addresses e attributions nella tabella actions
-- =========================================================================

-- -------------------------------------------------------------------------
-- FASE 1: BACKUP DELLE TABELLE ESISTENTI
-- -------------------------------------------------------------------------

-- Backup completo delle tabelle che verranno modificate/eliminate
CREATE TABLE actions_backup AS SELECT * FROM actions;
CREATE TABLE addresses_backup AS SELECT * FROM addresses;
CREATE TABLE attributions_backup AS SELECT * FROM attributions;

-- Verifica dei backup
SELECT 
    'actions_backup' as table_name, COUNT(*) as row_count 
FROM actions_backup
UNION ALL
SELECT 
    'addresses_backup' as table_name, COUNT(*) as row_count 
FROM addresses_backup
UNION ALL
SELECT 
    'attributions_backup' as table_name, COUNT(*) as row_count 
FROM attributions_backup
UNION ALL
SELECT 
    'actions_original' as table_name, COUNT(*) as row_count 
FROM actions;

-- -------------------------------------------------------------------------
-- FASE 2: MODIFICA STRUTTURA TABELLA ACTIONS
-- -------------------------------------------------------------------------

-- Aggiungere le nuove colonne per i dati denormalizzati
ALTER TABLE actions 
ADD COLUMN utm_source TEXT,
ADD COLUMN utm_medium TEXT,
ADD COLUMN utm_campaign TEXT,
ADD COLUMN utm_term TEXT,
ADD COLUMN utm_content TEXT,
ADD COLUMN country TEXT,
ADD COLUMN region TEXT,
ADD COLUMN city TEXT,
ADD COLUMN timezone TEXT,
ADD COLUMN latitude FLOAT8,
ADD COLUMN longitude FLOAT8;

-- Aggiungere commenti alle nuove colonne
COMMENT ON COLUMN actions.utm_source IS 'UTM source parameter identifying the traffic source (e.g., google, facebook, newsletter).';
COMMENT ON COLUMN actions.utm_medium IS 'UTM medium parameter identifying the marketing medium (e.g., cpc, email, social).';
COMMENT ON COLUMN actions.utm_campaign IS 'UTM campaign parameter identifying the specific campaign name.';
COMMENT ON COLUMN actions.utm_term IS 'UTM term parameter for paid search keywords.';
COMMENT ON COLUMN actions.utm_content IS 'UTM content parameter for A/B testing and content-targeted ads.';
COMMENT ON COLUMN actions.country IS 'Country where the action occurred.';
COMMENT ON COLUMN actions.region IS 'Region/State where the action occurred.';
COMMENT ON COLUMN actions.city IS 'City where the action occurred.';
COMMENT ON COLUMN actions.timezone IS 'Timezone of the action location.';
COMMENT ON COLUMN actions.latitude IS 'Latitude coordinate of the action location.';
COMMENT ON COLUMN actions.longitude IS 'Longitude coordinate of the action location.';

-- -------------------------------------------------------------------------
-- FASE 3: MIGRAZIONE DATI DA ATTRIBUTIONS
-- -------------------------------------------------------------------------

-- Migrare dati da attributions (se attribution_uuid è presente)
UPDATE actions 
SET 
    utm_source = attr.utm_source,
    utm_medium = attr.utm_medium,
    utm_campaign = attr.utm_campaign,
    utm_term = attr.utm_term,
    utm_content = attr.utm_content
FROM attributions attr
WHERE actions.attribution_uuid = attr.uuid;

-- Verifica migrazione attributions
SELECT 
    COUNT(*) as total_actions,
    COUNT(attribution_uuid) as actions_with_attribution,
    COUNT(utm_source) as actions_with_utm_source,
    COUNT(utm_campaign) as actions_with_utm_campaign
FROM actions;

-- -------------------------------------------------------------------------
-- FASE 4: MIGRAZIONE DATI DA ADDRESSES
-- -------------------------------------------------------------------------

-- Migrare dati da addresses (se address_uuid è presente)
UPDATE actions 
SET 
    country = addr.country,
    region = addr.region,
    city = addr.city,
    timezone = addr.timezone,
    latitude = addr.latitude,
    longitude = addr.longitude
FROM addresses addr
WHERE actions.address_uuid = addr.uuid;

-- Verifica migrazione addresses
SELECT 
    COUNT(*) as total_actions,
    COUNT(address_uuid) as actions_with_address,
    COUNT(country) as actions_with_country,
    COUNT(city) as actions_with_city
FROM actions;

-- -------------------------------------------------------------------------
-- FASE 5: VERIFICA INTEGRITÀ DATI
-- -------------------------------------------------------------------------

-- Controllo generale: verificare che i dati siano stati migrati correttamente
WITH migration_check AS (
    SELECT 
        a.uuid,
        a.utm_source,
        attr.utm_source as original_utm_source,
        a.country,
        addr.country as original_country,
        CASE 
            WHEN a.attribution_uuid IS NOT NULL AND (a.utm_source IS NULL OR a.utm_source != attr.utm_source) 
            THEN 'ATTRIBUTION_MISMATCH'
            WHEN a.address_uuid IS NOT NULL AND (a.country IS NULL OR a.country != addr.country)
            THEN 'ADDRESS_MISMATCH'
            ELSE 'OK'
        END as status
    FROM actions a
    LEFT JOIN attributions attr ON a.attribution_uuid = attr.uuid
    LEFT JOIN addresses addr ON a.address_uuid = addr.uuid
)
SELECT 
    status,
    COUNT(*) as count
FROM migration_check
GROUP BY status
ORDER BY status;

-- Mostrare alcuni esempi di record migrati
SELECT 
    uuid,
    action,
    utm_source,
    utm_campaign,
    country,
    city,
    occurred_at
FROM actions 
WHERE utm_source IS NOT NULL OR country IS NOT NULL
LIMIT 5;

-- -------------------------------------------------------------------------
-- FASE 6: RIMUOVERE FOREIGN KEY CONSTRAINTS E COLONNE VECCHIE
-- -------------------------------------------------------------------------

-- Rimuovere i constraint delle foreign key
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_attribution_uuid_fkey;
ALTER TABLE actions DROP CONSTRAINT IF EXISTS events_address_uuid_fkey;

-- Rimuovere le colonne delle foreign key
ALTER TABLE actions DROP COLUMN IF EXISTS attribution_uuid;
ALTER TABLE actions DROP COLUMN IF EXISTS address_uuid;

-- -------------------------------------------------------------------------
-- FASE 7: CREARE NUOVI INDICI OTTIMIZZATI
-- -------------------------------------------------------------------------

-- Indici per analisi attribution
CREATE INDEX IF NOT EXISTS idx_actions_utm_source ON actions(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_utm_campaign ON actions(utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_utm_source_time ON actions(utm_source, occurred_at) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_utm_campaign_time ON actions(utm_campaign, occurred_at) WHERE utm_campaign IS NOT NULL;

-- Indici per analisi geografiche
CREATE INDEX IF NOT EXISTS idx_actions_country ON actions(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_city ON actions(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_actions_country_time ON actions(country, occurred_at) WHERE country IS NOT NULL;

-- Indici per analisi per azione e tempo
CREATE INDEX IF NOT EXISTS idx_actions_action_time ON actions(action, occurred_at);
CREATE INDEX IF NOT EXISTS idx_actions_contact_time ON actions(contact_uuid, occurred_at);

-- Rimuovere indici vecchi che non servono più
DROP INDEX IF EXISTS idx_actions_attribution_uuid;
DROP INDEX IF EXISTS idx_events_address_uuid;

-- -------------------------------------------------------------------------
-- FASE 8: ELIMINARE TABELLE ORIGINALI
-- -------------------------------------------------------------------------

-- Eliminare le tabelle originali (ora i dati sono denormalizzati in actions)
DROP TABLE IF EXISTS attributions CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;

-- =========================================================================
-- FINE MIGRAZIONE
-- 
-- PROSSIMI PASSI MANUALI:
-- 1. Verificare che tutte le query di test restituiscano risultati sensati
-- 2. Testare l'applicazione con il nuovo schema
-- 3. Se tutto funziona correttamente, eliminare le tabelle di backup:
--    DROP TABLE actions_backup;
--    DROP TABLE addresses_backup; 
--    DROP TABLE attributions_backup;
-- =========================================================================