-- Alter 'details' column from TEXT to JSONB
ALTER TABLE events
ALTER COLUMN details TYPE JSONB
USING details::jsonb;

-- (Optional) Update the column comment to reflect the change
COMMENT ON COLUMN events.details IS 'Structured JSONB data capturing what happened, e.g., status codes, messages, or clicked URLs.';
