
-- Audit trigger handler function (INSERT, UPDATE)
CREATE OR REPLACE FUNCTION audit_trigger_handler()
RETURNS TRIGGER AS $$
BEGIN
    -- Set creation info only on INSERT
    IF TG_OP IN ('INSERT') THEN
        NEW.created_by := session_user;
        NEW.created_date := now();
    END IF;

    -- Always set update info on INSERT and UPDATE
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        NEW.updated_by := session_user;
        NEW.updated_date := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
