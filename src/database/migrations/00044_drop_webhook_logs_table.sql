-- Drop webhook_logs table and related objects

-- Drop indexes first
DROP INDEX IF EXISTS idx_webhook_logs_source_outcome;
DROP INDEX IF EXISTS idx_webhook_logs_contact_uuid;

-- Drop the table (this will also drop the sequence automatically)
DROP TABLE IF EXISTS webhook_logs CASCADE;
