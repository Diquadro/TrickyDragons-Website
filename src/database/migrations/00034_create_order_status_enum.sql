-- Migration: Create order_status enum
-- Date: 2025-01-27
-- Description: Create enum for different order statuses throughout the payment lifecycle

-- Create order status enumeration
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'canceled');

-- Add comment to enum type
COMMENT ON TYPE order_status IS 'Defines the status of an order: pending (awaiting payment), paid (payment successful), failed (payment failed), refunded (payment refunded), canceled (order canceled)';
