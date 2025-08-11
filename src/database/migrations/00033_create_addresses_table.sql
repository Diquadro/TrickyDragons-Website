-- Migration: Create addresses table
-- Date: 2025-01-27
-- Description: Create table to store billing and shipping addresses for contacts

-- Create addresses table
CREATE TABLE addresses (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_uuid UUID NOT NULL REFERENCES contacts(uuid) ON DELETE CASCADE,
    type address_type NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    is_default BOOLEAN DEFAULT false,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMPTZ,
    created_by TEXT,
    updated_by TEXT,
    deleted_by TEXT,
    deleted_date TIMESTAMPTZ,
    auto_serial SERIAL
);

-- Add comments to table and columns
COMMENT ON TABLE addresses IS 'Stores billing and shipping addresses for contacts, collected during checkout or profile updates';

COMMENT ON COLUMN addresses.uuid IS 'Universally unique identifier for the address';
COMMENT ON COLUMN addresses.contact_uuid IS 'Reference to the contact who owns this address';
COMMENT ON COLUMN addresses.type IS 'Type of address: billing for payment or shipping for delivery';
COMMENT ON COLUMN addresses.line1 IS 'First line of the address (street address, PO Box, company name)';
COMMENT ON COLUMN addresses.line2 IS 'Second line of the address (apartment, suite, unit, building, floor)';
COMMENT ON COLUMN addresses.city IS 'City, district, suburb, town, or village';
COMMENT ON COLUMN addresses.state IS 'State, county, province, or region';
COMMENT ON COLUMN addresses.postal_code IS 'ZIP or postal code';
COMMENT ON COLUMN addresses.country IS 'Two-letter country code (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN addresses.is_default IS 'Whether this is the default address of this type for the contact';
COMMENT ON COLUMN addresses.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN addresses.updated_date IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN addresses.created_by IS 'User who created the record';
COMMENT ON COLUMN addresses.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN addresses.deleted_by IS 'User who deleted the record';
COMMENT ON COLUMN addresses.deleted_date IS 'Timestamp when the record was deleted';
COMMENT ON COLUMN addresses.auto_serial IS 'Auto-incrementing serial number for easier data analysis and sequential referencing';

-- Create indexes for common queries
CREATE INDEX idx_addresses_contact_uuid ON addresses(contact_uuid);
CREATE INDEX idx_addresses_type ON addresses(type);
CREATE INDEX idx_addresses_is_default ON addresses(is_default) WHERE is_default = true;
CREATE INDEX idx_addresses_created_date ON addresses(created_date);

-- Create unique constraint for one default address per contact per type
CREATE UNIQUE INDEX idx_addresses_unique_default 
ON addresses(contact_uuid, type) 
WHERE is_default = true;
