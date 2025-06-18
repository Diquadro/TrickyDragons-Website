-- =========================================================================
-- MIGRAZIONE AGGIUNTA AUTO_SERIAL ALLE TABELLE PRINCIPALI
-- Data: 2025-01-01
-- Descrizione: Aggiunge una colonna auto_serial SERIAL alle tabelle principali per analisi e numerazione progressiva
-- =========================================================================

-- Aggiungere la colonna auto_serial alla tabella contacts
ALTER TABLE contacts
ADD COLUMN auto_serial SERIAL;

COMMENT ON COLUMN contacts.auto_serial IS 'Auto-incrementing serial number for easier data analysis and sequential referencing.';

-- Aggiungere la colonna auto_serial alla tabella actions
ALTER TABLE actions
ADD COLUMN auto_serial SERIAL;

COMMENT ON COLUMN actions.auto_serial IS 'Auto-incrementing serial number for easier data analysis and sequential referencing.';

-- =========================================================================
-- PULIZIA TABELLE DI BACKUP
-- =========================================================================

-- Le seguenti tabelle di backup sono state create nella migrazione 00022
-- e ora vengono eliminate perché la denormalizzazione è stata verificata:

DROP TABLE IF EXISTS actions_backup;
DROP TABLE IF EXISTS addresses_backup;
DROP TABLE IF EXISTS attributions_backup;

-- Verifica che le tabelle di backup esistano prima di eliminarle:
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('actions_backup', 'addresses_backup', 'attributions_backup')
ORDER BY tablename; 