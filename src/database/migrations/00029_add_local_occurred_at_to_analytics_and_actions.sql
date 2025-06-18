-- Add local_occurred_at column to both analytics_events and actions tables

-- Add to analytics_events table
ALTER TABLE analytics_events 
ADD COLUMN local_occurred_at TIMESTAMPTZ;

COMMENT ON COLUMN analytics_events.local_occurred_at IS 'Timestamp when the event occurred in the users local timezone - calculated server-side using client or IP-based timezone';

-- Add to actions table  
ALTER TABLE actions 
ADD COLUMN local_occurred_at TIMESTAMPTZ;

COMMENT ON COLUMN actions.local_occurred_at IS 'Timestamp when the action occurred in the users local timezone - calculated server-side using client or IP-based timezone'; 