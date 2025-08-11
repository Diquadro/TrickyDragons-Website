-- Migration: Create orders table
-- Date: 2025-01-27
-- Description: Create table to store orders with Stripe payment integration

-- Create orders table
CREATE TABLE orders (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_uuid UUID REFERENCES contacts(uuid) ON DELETE SET NULL,
    email TEXT NOT NULL,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT UNIQUE,
    status order_status NOT NULL DEFAULT 'pending',
    amount_total INTEGER NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    billing_address_uuid UUID REFERENCES addresses(uuid) ON DELETE SET NULL,
    shipping_address_uuid UUID REFERENCES addresses(uuid) ON DELETE SET NULL,
    line_items JSONB,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    timezone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    local_occurred_at TIMESTAMPTZ,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMPTZ,
    created_by TEXT,
    updated_by TEXT,
    deleted_by TEXT,
    deleted_date TIMESTAMPTZ,
    auto_serial SERIAL
);

-- Add comments to table and columns
COMMENT ON TABLE orders IS 'Stores customer orders with Stripe payment integration and tracking information';

COMMENT ON COLUMN orders.uuid IS 'Universally unique identifier for the order';
COMMENT ON COLUMN orders.contact_uuid IS 'Reference to the contact who placed the order, nullable if contact is deleted';
COMMENT ON COLUMN orders.email IS 'Email address of the customer, preserved even if contact is deleted';
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe Checkout Session ID for tracking payment flow';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payment status';
COMMENT ON COLUMN orders.status IS 'Current status of the order in the payment lifecycle';
COMMENT ON COLUMN orders.amount_total IS 'Total amount charged in smallest currency unit (cents for USD)';
COMMENT ON COLUMN orders.currency IS 'Three-letter ISO currency code';
COMMENT ON COLUMN orders.billing_address_uuid IS 'Reference to the billing address used for this order';
COMMENT ON COLUMN orders.shipping_address_uuid IS 'Reference to the shipping address used for this order';
COMMENT ON COLUMN orders.line_items IS 'JSON array of purchased items from Stripe session';
COMMENT ON COLUMN orders.utm_source IS 'UTM source parameter identifying the traffic source';
COMMENT ON COLUMN orders.utm_medium IS 'UTM medium parameter identifying the marketing medium';
COMMENT ON COLUMN orders.utm_campaign IS 'UTM campaign parameter identifying the specific campaign';
COMMENT ON COLUMN orders.utm_term IS 'UTM term parameter for paid search keywords';
COMMENT ON COLUMN orders.utm_content IS 'UTM content parameter for A/B testing and content-targeted ads';
COMMENT ON COLUMN orders.country IS 'Country where the order was placed';
COMMENT ON COLUMN orders.region IS 'Region/State where the order was placed';
COMMENT ON COLUMN orders.city IS 'City where the order was placed';
COMMENT ON COLUMN orders.timezone IS 'Timezone where the order was placed';
COMMENT ON COLUMN orders.latitude IS 'Latitude coordinate where the order was placed';
COMMENT ON COLUMN orders.longitude IS 'Longitude coordinate where the order was placed';
COMMENT ON COLUMN orders.occurred_at IS 'Timestamp when the order was placed';
COMMENT ON COLUMN orders.local_occurred_at IS 'Timestamp when the order was placed in the customer local timezone';
COMMENT ON COLUMN orders.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN orders.updated_date IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN orders.created_by IS 'User who created the record';
COMMENT ON COLUMN orders.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN orders.deleted_by IS 'User who deleted the record';
COMMENT ON COLUMN orders.deleted_date IS 'Timestamp when the record was deleted';
COMMENT ON COLUMN orders.auto_serial IS 'Auto-incrementing serial number for easier data analysis and sequential referencing';

-- Create indexes for common queries
CREATE INDEX idx_orders_contact_uuid ON orders(contact_uuid);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_date ON orders(created_date);
CREATE INDEX idx_orders_occurred_at ON orders(occurred_at);
CREATE INDEX idx_orders_utm_source ON orders(utm_source);
CREATE INDEX idx_orders_utm_campaign ON orders(utm_campaign);
