ALTER TABLE events
ADD COLUMN endpoint TEXT;

COMMENT ON COLUMN events.endpoint IS
'Stores a summary of the HTTP method and endpoint (e.g., "POST - /api/subscribe").';

CREATE TYPE event_direction AS ENUM ('inbound', 'outbound');

ALTER TABLE events
ADD COLUMN direction event_direction;

COMMENT ON COLUMN events.direction IS
'Specifies the direction of the event: inbound (incoming) or outbound (outgoing).';
