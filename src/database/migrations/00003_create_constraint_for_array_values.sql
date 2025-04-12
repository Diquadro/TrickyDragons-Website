CREATE OR REPLACE FUNCTION array_has_duplicates(arr anyarray)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) <> COUNT(DISTINCT elem)
    FROM unnest(arr) AS elem
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE contacts
ADD CONSTRAINT no_duplicate_subscriptions
CHECK (NOT array_has_duplicates(subscriptions));