-- Migration: Alter orders table - add billing_* fields and drop geo_* fields
-- Date: 2025-08-12
-- Description: Store checkout billing info redundantly on orders; remove non-authoritative geo fields captured from webhooks

-- STEP 1: Add billing_* columns (authoritative snapshot from Stripe Checkout)
ALTER TABLE orders
ADD COLUMN billing_name TEXT,
ADD COLUMN billing_email TEXT,
ADD COLUMN billing_phone TEXT,
ADD COLUMN billing_country TEXT,
ADD COLUMN billing_region TEXT,
ADD COLUMN billing_city TEXT,
ADD COLUMN billing_postal_code TEXT,
ADD COLUMN billing_line1 TEXT,
ADD COLUMN billing_line2 TEXT;

-- STEP 2: Comments
COMMENT ON COLUMN orders.billing_name IS 'Full billing name captured at checkout (Stripe customer_details.name)';
COMMENT ON COLUMN orders.billing_email IS 'Billing email captured at checkout (Stripe customer_details.email)';
COMMENT ON COLUMN orders.billing_phone IS 'Billing phone captured at checkout (Stripe customer_details.phone)';
COMMENT ON COLUMN orders.billing_country IS 'Billing country code (ISO-2) captured at checkout';
COMMENT ON COLUMN orders.billing_region IS 'Billing state/region captured at checkout';
COMMENT ON COLUMN orders.billing_city IS 'Billing city captured at checkout';
COMMENT ON COLUMN orders.billing_postal_code IS 'Billing postal/ZIP code captured at checkout';
COMMENT ON COLUMN orders.billing_line1 IS 'Billing address line 1 captured at checkout';
COMMENT ON COLUMN orders.billing_line2 IS 'Billing address line 2 captured at checkout';

-- STEP 3: Drop non-authoritative geo fields previously filled from webhook request
ALTER TABLE orders
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS region,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS timezone,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude;


