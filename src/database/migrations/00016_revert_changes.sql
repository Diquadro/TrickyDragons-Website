ALTER TABLE actions
RENAME TO events;

CREATE TYPE event_direction AS ENUM ('inbound', 'outbound');

CREATE TYPE event_outcome AS ENUM ('success', 'failure');

ALTER TABLE events
ALTER COLUMN direction TYPE event_direction USING direction::text::event_direction;

ALTER TABLE events
ALTER COLUMN outcome TYPE event_outcome USING outcome::text::event_outcome;

DROP TYPE action_direction;

DROP TYPE action_outcome;