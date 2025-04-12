-- 1. Drop the 'referrer' column
ALTER TABLE events
DROP COLUMN referrer;

-- 2. Alter 'origin' and 'action' to TEXT
ALTER TABLE events
ALTER COLUMN origin TYPE TEXT,
ALTER COLUMN action TYPE TEXT;

-- 3. Drop ENUM types 'event_origin' and 'event_action'
DROP TYPE IF EXISTS event_origin;
DROP TYPE IF EXISTS event_action;

-- 4. Update comments
COMMENT ON COLUMN events.origin IS 'Generic origin of the event';
COMMENT ON COLUMN events.action IS 'Describes the type of event';
