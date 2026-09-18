-- Migration: Add source column to contacts table
-- Description: Track whether a contact originated from the website (organic signup/purchase flow)
-- or was bulk-imported from an external campaign ("migration"). Used to exclude non-website
-- contacts from the automated welcome-email cron jobs.

ALTER TABLE contacts
ADD COLUMN source TEXT;

-- Backfill existing contacts: all of them were created through the website prior to this migration.
UPDATE contacts SET source = 'website' WHERE source IS NULL;

ALTER TABLE contacts
ALTER COLUMN source SET NOT NULL;

COMMENT ON COLUMN contacts.source IS 'Origin of the contact record: website (organic signup/purchase flow) or migration (bulk-imported from external campaigns).';
