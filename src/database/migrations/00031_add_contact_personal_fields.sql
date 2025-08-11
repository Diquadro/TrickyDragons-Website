-- Migration: Add personal fields to contacts table
-- Date: 2025-01-27
-- Description: Add first_name and last_name columns to store customer information from Stripe checkout

-- Add personal information columns to contacts table
ALTER TABLE contacts 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Add comments to new columns
COMMENT ON COLUMN contacts.first_name IS 'First name of the contact, typically collected during checkout or registration';
COMMENT ON COLUMN contacts.last_name IS 'Last name of the contact, typically collected during checkout or registration';
