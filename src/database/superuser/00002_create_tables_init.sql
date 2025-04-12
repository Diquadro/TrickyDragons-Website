
-- Enable UUID extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE contact_status AS ENUM ('lead', 'prospect', 'customer');
CREATE TYPE contact_subscriptions AS ENUM ('newsletter');
CREATE TYPE event_origin AS ENUM ('www', 'server', 'email');
CREATE TYPE event_action AS ENUM (
  'email_send',
  'contact_create',
  'contact_subscribe',
  'contact_unsubscribe',
  'link_redirect'
);
CREATE TYPE event_outcome AS ENUM ('success', 'failure');

-- Table: contacts
CREATE TABLE contacts (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  status contact_status NOT NULL,
  subscriptions contact_subscriptions[],
  created_by TEXT NOT NULL,
  created_date TIMESTAMPTZ NOT NULL,
  updated_by TEXT NOT NULL,
  updated_date TIMESTAMPTZ NOT NULL,
  deleted_by TEXT,
  deleted_date TIMESTAMPTZ
);

COMMENT ON TABLE contacts IS 'Stores contact details including leads, prospects, and customers.';
COMMENT ON COLUMN contacts.uuid IS 'Universally unique identifier for the contact.';
COMMENT ON COLUMN contacts.email IS 'Primary email used for contact identification and communication.';
COMMENT ON COLUMN contacts.status IS 'Stage of the contact in the sales funnel: lead, prospect, or customer.';
COMMENT ON COLUMN contacts.subscriptions IS 'List of subscriptions assigned to the contact.';
COMMENT ON COLUMN contacts.created_by IS 'User who created the record.';
COMMENT ON COLUMN contacts.created_date IS 'Timestamp when the record was created.';
COMMENT ON COLUMN contacts.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN contacts.updated_date IS 'Timestamp when the record was last updated.';
COMMENT ON COLUMN contacts.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN contacts.deleted_date IS 'Timestamp when the record was deleted.';

-- Table: addresses
CREATE TABLE addresses (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT,
  state TEXT,
  country TEXT,
  created_by TEXT NOT NULL,
  created_date TIMESTAMPTZ NOT NULL,
  updated_by TEXT NOT NULL,
  updated_date TIMESTAMPTZ NOT NULL,
  deleted_by TEXT,
  deleted_date TIMESTAMPTZ
);

COMMENT ON TABLE addresses IS 'Stores geographic locations associated with events.';
COMMENT ON COLUMN addresses.uuid IS 'Universally unique identifier for the address.';
COMMENT ON COLUMN addresses.city IS 'City of the address.';
COMMENT ON COLUMN addresses.state IS 'State/Region of the address.';
COMMENT ON COLUMN addresses.country IS 'Country of the address.';
COMMENT ON COLUMN addresses.created_by IS 'User who created the record.';
COMMENT ON COLUMN addresses.created_date IS 'Timestamp when the record was created.';
COMMENT ON COLUMN addresses.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN addresses.updated_date IS 'Timestamp when the record was last updated.';
COMMENT ON COLUMN addresses.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN addresses.deleted_date IS 'Timestamp when the record was deleted.';

-- Table: events
CREATE TABLE events (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_uuid UUID REFERENCES contacts(uuid) ON DELETE SET NULL,
  address_uuid UUID REFERENCES addresses(uuid) ON DELETE SET NULL,
  origin event_origin NOT NULL,
  referrer TEXT,
  action event_action NOT NULL,
  outcome event_outcome NOT NULL,
  details TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_by TEXT NOT NULL,
  created_date TIMESTAMPTZ NOT NULL,
  updated_by TEXT NOT NULL,
  updated_date TIMESTAMPTZ NOT NULL,
  deleted_by TEXT,
  deleted_date TIMESTAMPTZ
);

COMMENT ON TABLE events IS 'Tracks all events, including system-generated communications and user actions, even for anonymous visitors.';
COMMENT ON COLUMN events.uuid IS 'Universally unique identifier for the event.';
COMMENT ON COLUMN events.contact_uuid IS 'Reference to the contact involved in the event. Nullable for anonymous visitors.';
COMMENT ON COLUMN events.address_uuid IS 'Reference to the geographic location (IP-based) of the event.';
COMMENT ON COLUMN events.origin IS 'Origin of the event: website, email, etc.';
COMMENT ON COLUMN events.referrer IS 'Origin name from which the event originated.';
COMMENT ON COLUMN events.action IS 'Defines the nature of the event: email_send, newsletter_subscribe, etc.';
COMMENT ON COLUMN events.outcome IS 'Outcome of the event, success or failure.';
COMMENT ON COLUMN events.details IS 'Descriptive field capturing what happened, e.g., the URL clicked or the action taken.';
COMMENT ON COLUMN events.occurred_at IS 'Timestamp indicating when the event took place.';
COMMENT ON COLUMN events.created_by IS 'User who created the record.';
COMMENT ON COLUMN events.created_date IS 'Timestamp when the record was created.';
COMMENT ON COLUMN events.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN events.updated_date IS 'Timestamp when the record was last updated.';
COMMENT ON COLUMN events.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN events.deleted_date IS 'Timestamp when the record was deleted.';

-- Indexes for events
CREATE INDEX idx_events_contact_uuid ON events(contact_uuid);
CREATE INDEX idx_events_address_uuid ON events(address_uuid);
