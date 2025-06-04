-- Correzione commento per actions.contact_uuid
COMMENT ON COLUMN actions.contact_uuid IS 'Reference to the contact involved in the event. Always required as actions table tracks identified users only.';
