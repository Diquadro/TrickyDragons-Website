ALTER TABLE events DROP CONSTRAINT events_contact_uuid_fkey;

ALTER TABLE events
ADD CONSTRAINT evnts_conctacts_uuid_fkey
FOREIGN KEY (contact_uuid)
REFERENCES contacts(uuid)
ON DELETE CASCADE;

ALTER TABLE events ALTER COLUMN contact_uuid SET NOT NULL;
