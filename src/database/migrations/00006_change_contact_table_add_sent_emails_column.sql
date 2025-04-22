-- Add column: sent_emails
ALTER TABLE contacts
ADD COLUMN sent_emails TEXT[];

-- Comment: description for sent_emails
COMMENT ON COLUMN contacts.sent_emails IS
'Stores the list of email identifiers (e.g., "welcome", "20250401_newsletter") that have been sent to the contact by the system.';
