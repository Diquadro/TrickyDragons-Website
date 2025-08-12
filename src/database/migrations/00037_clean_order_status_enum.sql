-- Migration: Clean order_status enum 
-- Date: 2025-01-27
-- Description: Remove 'pending' state from order_status enum since webhook-first approach creates orders with final states only

-- Step 1: Create new enum with cleaned values
CREATE TYPE order_status_new AS ENUM ('paid', 'failed', 'canceled', 'refunded');

-- Step 2: Add temporary column with new type
ALTER TABLE orders ADD COLUMN status_new order_status_new;

-- Step 3: Migrate existing data (if any) - convert pending to failed as fallback
UPDATE orders SET status_new = 
    CASE 
        WHEN status = 'pending' THEN 'failed'::order_status_new
        ELSE status::text::order_status_new 
    END 
WHERE status IS NOT NULL;

-- Step 4: Drop old column and rename new one
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE orders RENAME COLUMN status_new TO status;

-- Step 5: Set NOT NULL constraint and default
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'failed';

-- Step 6: Drop old enum type
DROP TYPE order_status;

-- Step 7: Rename new enum type to original name
ALTER TYPE order_status_new RENAME TO order_status;

-- Step 8: Add comments
COMMENT ON TYPE order_status IS 'Defines the final status of an order: paid (payment successful), failed (payment failed), canceled (order canceled), refunded (payment refunded).';
COMMENT ON COLUMN orders.status IS 'Current final status of the order - Set default to "failed" as a safety measure (though orders should always be created with explicit status)';