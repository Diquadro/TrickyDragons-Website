-- Migration: Add pending to order_status enum
-- Date: 2025-09-03
-- Description: Add 'pending' status to order_status enum to support payment_intent.created webhook events

-- Add 'pending' value to existing order_status enum
ALTER TYPE order_status ADD VALUE 'pending';

-- Update enum comment to reflect new status
COMMENT ON TYPE order_status IS 'Defines the status of an order: pending (payment intent created), paid (payment successful), failed (payment failed), canceled (order canceled), refunded (payment refunded).';

-- Note: 'pending' will be used for orders created from payment_intent.created webhook events
-- The status hierarchy will be: pending -> paid/failed/canceled -> refunded
