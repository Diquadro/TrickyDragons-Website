-- Migration: Cleanup soft-delete and UTM fields; add audit triggers
-- Date: 2025-08-12
-- Description:
--  - Drop deleted_by and deleted_date from tables that still have them (addresses, orders)
--  - Drop UTM fields from orders (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
--  - Drop related orders UTM indexes
--  - Add audit trigger (created_*/updated_*) to new tables: addresses, orders

-- =====================
-- DROP SOFT-DELETE FIELDS
-- =====================

-- Addresses: remove soft-delete columns if present
ALTER TABLE IF EXISTS addresses
  DROP COLUMN IF EXISTS deleted_by,
  DROP COLUMN IF EXISTS deleted_date;

-- Orders: remove soft-delete columns if present
ALTER TABLE IF EXISTS orders
  DROP COLUMN IF EXISTS deleted_by,
  DROP COLUMN IF EXISTS deleted_date;

-- =====================
-- DROP ORDERS UTM FIELDS + INDEXES
-- =====================

DROP INDEX IF EXISTS idx_orders_utm_source;
DROP INDEX IF EXISTS idx_orders_utm_campaign;

-- Drop UTM columns from orders
ALTER TABLE IF EXISTS orders
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  DROP COLUMN IF EXISTS utm_term,
  DROP COLUMN IF EXISTS utm_content;

-- =====================
-- ENSURE AUDIT TRIGGERS ON NEW TABLES
-- =====================

CREATE OR REPLACE TRIGGER audit_addresses_trg BEFORE INSERT OR UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION audit_fields_handler();

CREATE OR REPLACE TRIGGER audit_orders_trg BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION audit_fields_handler();



