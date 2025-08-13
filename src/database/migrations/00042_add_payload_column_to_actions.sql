-- Add payload column to actions table for storing complete webhook payloads
-- This will store the full webhook payload while details contains only key information
ALTER TABLE actions
ADD COLUMN payload JSONB;

-- Add comment for documentation
COMMENT ON COLUMN actions.payload IS 'Complete webhook payload or request data - stores full original data for reference and debugging';