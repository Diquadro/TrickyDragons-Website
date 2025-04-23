-- Make created_* and updated_* columns nullable in all tables
ALTER TABLE contacts
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN created_date DROP NOT NULL,
  ALTER COLUMN updated_by DROP NOT NULL,
  ALTER COLUMN updated_date DROP NOT NULL;

ALTER TABLE addresses
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN created_date DROP NOT NULL,
  ALTER COLUMN updated_by DROP NOT NULL,
  ALTER COLUMN updated_date DROP NOT NULL;

ALTER TABLE events
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN created_date DROP NOT NULL,
  ALTER COLUMN updated_by DROP NOT NULL,
  ALTER COLUMN updated_date DROP NOT NULL;

-- Remove deleted_* columns from all tables
ALTER TABLE contacts
  DROP COLUMN deleted_by,
  DROP COLUMN deleted_date;

ALTER TABLE addresses
  DROP COLUMN deleted_by,
  DROP COLUMN deleted_date;

ALTER TABLE events
  DROP COLUMN deleted_by,
  DROP COLUMN deleted_date;
