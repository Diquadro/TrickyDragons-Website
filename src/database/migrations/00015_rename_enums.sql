CREATE TYPE action_direction AS ENUM ('inbound', 'outbound');

CREATE TYPE action_outcome AS ENUM ('success', 'failure');

ALTER TABLE actions
ALTER COLUMN direction TYPE action_direction USING direction::text::action_direction;

ALTER TABLE actions
ALTER COLUMN outcome TYPE action_outcome USING outcome::text::action_outcome;

DROP TYPE event_direction;

DROP TYPE event_outcome;