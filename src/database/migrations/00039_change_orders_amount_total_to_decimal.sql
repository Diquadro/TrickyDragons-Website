-- Migration: Change orders.amount_total to decimal major units
-- Date: 2025-08-12
-- Description: Store order amounts as decimal in major currency units (e.g., 1.00 USD) instead of integer cents

-- Change type to NUMERIC(12,2) and convert existing cent values to major units
ALTER TABLE orders
ALTER COLUMN amount_total TYPE NUMERIC(12,2)
USING (COALESCE(amount_total, 0)::NUMERIC / 100.0);

COMMENT ON COLUMN orders.amount_total IS 'Order total in major currency units (e.g., 1.00 USD). Previously stored as integer cents.';


