-- Migration: Create address_type enum
-- Date: 2025-01-27
-- Description: Create enum for different types of addresses (billing, shipping)

-- Create address type enumeration
CREATE TYPE address_type AS ENUM ('billing', 'shipping');

-- Add comment to enum type
COMMENT ON TYPE address_type IS 'Defines the type of address: billing for payment info, shipping for delivery info';
