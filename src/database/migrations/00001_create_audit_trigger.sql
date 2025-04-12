
-- Audit trigger handler function (INSERT, UPDATE)
CREATE OR REPLACE FUNCTION create_audit_trigger_handler()
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

-- Creates an audit trigger on a given table, if it does not already exist
CREATE OR REPLACE FUNCTION create_audit_trigger(schema_name TEXT, table_name TEXT)
RETURNS VOID AS $$
DECLARE
    trigger_name TEXT := 'audit_' || table_name || '_trg';
    trigger_exists BOOLEAN;
BEGIN
    -- Verifica se il trigger esiste già
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = trigger_name
    ) INTO trigger_exists;

    -- Se non esiste, lo crea
    IF NOT trigger_exists THEN
        EXECUTE format(
            'CREATE TRIGGER %I
             BEFORE INSERT OR UPDATE ON %I.%I
             FOR EACH ROW EXECUTE FUNCTION create_audit_trigger_handler();',
            trigger_name, schema_name, table_name
        );
    END IF;
END;
$$ LANGUAGE plpgsql;


-- DDL audit event trigger handler
CREATE OR REPLACE FUNCTION create_audit_event_trigger_handler()
RETURNS EVENT_TRIGGER AS $$
DECLARE
    var_full_name TEXT;
    var_schema_name TEXT;
    var_table_name TEXT;
BEGIN
    -- Loop through all DDL CREATE TABLE commands in the 'public' schema
    FOR var_full_name IN
        SELECT object_identity
        FROM pg_event_trigger_ddl_commands() 
        WHERE schema_name = 'public' 
            AND command_tag = 'CREATE TABLE'
    LOOP
        -- Split 'public.contacts' into schema and table
        var_schema_name := split_part(var_full_name, '.', 1);
        var_table_name := split_part(var_full_name, '.', 2);

        PERFORM create_audit_trigger(var_schema_name, var_table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- DDL event trigger creation
CREATE EVENT TRIGGER create_audit_event_trigger
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION create_audit_event_trigger_handler();
