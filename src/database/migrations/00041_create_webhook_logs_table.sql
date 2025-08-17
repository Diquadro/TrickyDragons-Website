-- Create webhook_logs table for tracking webhook requests and responses
-- This table logs all webhook events, especially when contacts are not found
CREATE TABLE webhook_logs (
	uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
	-- Request metadata
	webhook_source VARCHAR(50) NOT NULL, -- 'smtp2go', 'stripe', etc.
	request_method VARCHAR(10) NOT NULL, -- 'POST', 'GET', etc.
	request_url TEXT NOT NULL,
	request_headers JSONB,
	request_body JSONB,
	-- Response metadata  
	response_status INTEGER,
	response_body JSONB,
	-- Processing details
	processing_outcome VARCHAR(50) NOT NULL, -- 'success', 'contact_not_found', 'validation_error', 'processing_error'
	processing_message TEXT, -- Human readable description
	error_details JSONB, -- Stack trace, validation errors, etc.
	-- Analytics fields
	contact_uuid UUID REFERENCES contacts (uuid), -- NULL if contact not found
	action_created BOOLEAN DEFAULT FALSE, -- Whether an action was successfully created
	-- Timestamps
	occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
	local_occurred_at TIMESTAMPTZ,
	-- Audit fields (automatically filled by trigger)
	created_by TEXT,
	created_date TIMESTAMPTZ,
	updated_by TEXT,
	updated_date TIMESTAMPTZ,
	-- Sequential numbering for analysis
	auto_serial SERIAL
);

-- Comments for documentation
COMMENT ON TABLE webhook_logs IS 'Comprehensive logging of all webhook requests and responses for debugging and analytics';

COMMENT ON COLUMN webhook_logs.webhook_source IS 'Source of the webhook (smtp2go, stripe, etc.)';

COMMENT ON COLUMN webhook_logs.processing_outcome IS 'Result of webhook processing: success, contact_not_found, validation_error, processing_error';

COMMENT ON COLUMN webhook_logs.processing_message IS 'Human-readable description of what happened during processing';

COMMENT ON COLUMN webhook_logs.error_details IS 'Technical error details including stack traces and validation errors';

COMMENT ON COLUMN webhook_logs.contact_uuid IS 'Reference to contact if found, NULL if contact not found';

COMMENT ON COLUMN webhook_logs.action_created IS 'Whether an action record was successfully created in the actions table';

COMMENT ON COLUMN webhook_logs.auto_serial IS 'Sequential number for easier data analysis and referencing';

-- Indexes for performance
CREATE INDEX idx_webhook_logs_source_outcome ON webhook_logs (webhook_source, processing_outcome);

CREATE INDEX idx_webhook_logs_contact_uuid ON webhook_logs (contact_uuid)
WHERE
	contact_uuid IS NOT NULL;

CREATE INDEX idx_webhook_logs_occurred_at ON webhook_logs (occurred_at);

CREATE INDEX idx_webhook_logs_auto_serial ON webhook_logs (auto_serial);

-- Add audit trigger manually (since create_audit_trigger function may not exist)
CREATE TRIGGER audit_webhook_logs_trg BEFORE INSERT
OR
UPDATE ON webhook_logs FOR EACH ROW EXECUTE FUNCTION audit_fields_handler ();