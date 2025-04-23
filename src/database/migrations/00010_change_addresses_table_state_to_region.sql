ALTER TABLE addresses RENAME COLUMN state TO region;

COMMENT ON COLUMN addresses.region IS 'Region/State of the address.';
