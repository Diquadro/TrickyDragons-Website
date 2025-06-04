ALTER TABLE analytics_events
ADD COLUMN created_by TEXT NOT NULL,
ADD COLUMN updated_by TEXT NOT NULL,
ADD COLUMN updated_date TIMESTAMPTZ NOT NULL;

COMMENT ON COLUMN analytics_events.created_by IS 'User who created the record.';
COMMENT ON COLUMN analytics_events.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN analytics_events.updated_date IS 'Timestamp when the record was last updated.';