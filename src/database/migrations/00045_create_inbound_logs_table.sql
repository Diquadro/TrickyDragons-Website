-- Migration: Create inbound_logs table
-- Date: 2025-09-05
-- Description: Create table to log all inbound HTTP requests for debugging and analytics

CREATE TABLE inbound_logs (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request details
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB,
    query_params JSONB,
    body JSONB,
    
    -- Client info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Audit fields (automatically filled by trigger)
    created_by TEXT,
    created_date TIMESTAMPTZ,
    updated_by TEXT,
    updated_date TIMESTAMPTZ,
    
    -- Sequential numbering
    auto_serial SERIAL
);

-- Add comments
COMMENT ON TABLE inbound_logs IS 'Logs all inbound HTTP requests for debugging and analytics purposes';

COMMENT ON COLUMN inbound_logs.uuid IS 'Universally unique identifier for the log entry';
COMMENT ON COLUMN inbound_logs.method IS 'HTTP method (GET, POST, PUT, DELETE, etc.)';
COMMENT ON COLUMN inbound_logs.url IS 'Full request URL including path and query string';
COMMENT ON COLUMN inbound_logs.headers IS 'HTTP request headers as JSON object (sensitive headers redacted)';
COMMENT ON COLUMN inbound_logs.query_params IS 'URL query parameters as JSON object';
COMMENT ON COLUMN inbound_logs.body IS 'Request body as JSON (sensitive fields redacted)';
COMMENT ON COLUMN inbound_logs.ip_address IS 'Client IP address (supports IPv4 and IPv6)';
COMMENT ON COLUMN inbound_logs.user_agent IS 'Client User-Agent string';
COMMENT ON COLUMN inbound_logs.occurred_at IS 'Timestamp when the request was received';
COMMENT ON COLUMN inbound_logs.auto_serial IS 'Auto-incrementing serial number for easier data analysis';

-- Create indexes for common queries
CREATE INDEX idx_inbound_logs_method ON inbound_logs(method);
CREATE INDEX idx_inbound_logs_occurred_at ON inbound_logs(occurred_at);
CREATE INDEX idx_inbound_logs_ip_address ON inbound_logs(ip_address);
CREATE INDEX idx_inbound_logs_auto_serial ON inbound_logs(auto_serial);

-- Add audit trigger (created_by, created_date, updated_by, updated_date)
CREATE TRIGGER audit_inbound_logs_trg 
    BEFORE INSERT OR UPDATE ON inbound_logs 
    FOR EACH ROW EXECUTE FUNCTION audit_fields_handler();
