-- Migration: Update order_status enum and add order_uuid to actions table
-- Date: 2025-01-27
-- Description: Remove pending state from order_status (not needed with webhook-first approach) and add order_uuid reference to actions table for webhook tracking

-- Step 1: Add order_uuid column to actions table
ALTER TABLE actions 
ADD COLUMN order_uuid UUID REFERENCES orders(uuid) ON DELETE SET NULL;

-- Step 2: Add comment to the new column
COMMENT ON COLUMN actions.order_uuid IS 'Reference to the order associated with this action, particularly useful for tracking webhook events and order-related activities';

-- Step 3: Add index for better performance on order_uuid lookups
CREATE INDEX idx_actions_order_uuid ON actions(order_uuid);

-- Step 4: Add comment to the index
COMMENT ON INDEX idx_actions_order_uuid IS 'Improves performance for queries filtering actions by order_uuid, especially useful for webhook event tracking';

-- Note: We are not removing 'pending' from order_status enum yet as it might break existing data
-- This will be handled in production deployment after ensuring no orders have 'pending' status
-- The webhook implementation will only create orders with final states: paid, failed, canceled, refunded
