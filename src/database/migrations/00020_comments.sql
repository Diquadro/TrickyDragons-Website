-- Commenti mancanti per la tabella analytics_events

-- Commenti sulle colonne senza note
COMMENT ON COLUMN analytics_events.page_title IS 'Title of the page where the event occurred.';
COMMENT ON COLUMN analytics_events.utm_source IS 'UTM source parameter identifying the traffic source (e.g., google, facebook, newsletter).';
COMMENT ON COLUMN analytics_events.utm_medium IS 'UTM medium parameter identifying the marketing medium (e.g., cpc, email, social).';
COMMENT ON COLUMN analytics_events.utm_campaign IS 'UTM campaign parameter identifying the specific campaign name.';
COMMENT ON COLUMN analytics_events.utm_term IS 'UTM term parameter for paid search keywords.';
COMMENT ON COLUMN analytics_events.utm_content IS 'UTM content parameter for A/B testing and content-targeted ads.';
COMMENT ON COLUMN analytics_events.user_agent IS 'Browser user agent string for device and browser identification.';
COMMENT ON COLUMN analytics_events.browser_name IS 'Name of the browser (e.g., Chrome, Firefox, Safari).';
COMMENT ON COLUMN analytics_events.browser_version IS 'Version of the browser.';
COMMENT ON COLUMN analytics_events.os_name IS 'Operating system name (e.g., Windows, macOS, Linux, Android, iOS).';
COMMENT ON COLUMN analytics_events.os_version IS 'Version of the operating system.';
COMMENT ON COLUMN analytics_events.device_type IS 'Type of device used (e.g., desktop, mobile, tablet).';
COMMENT ON COLUMN analytics_events.country IS 'Country where the event occurred.';
COMMENT ON COLUMN analytics_events.region IS 'Region/State where the event occurred.';
COMMENT ON COLUMN analytics_events.city IS 'City where the event occurred.';
COMMENT ON COLUMN analytics_events.timezone IS 'Timezone of the user when the event occurred.';
COMMENT ON COLUMN analytics_events.latitude IS 'Latitude coordinate of the event location.';
COMMENT ON COLUMN analytics_events.longitude IS 'Longitude coordinate of the event location.';
COMMENT ON COLUMN analytics_events.screen_resolution IS 'Screen resolution of the user device (e.g., 1920x1080).';
COMMENT ON COLUMN analytics_events.viewport_size IS 'Browser viewport size (e.g., 1440x900).';
COMMENT ON COLUMN analytics_events.language IS 'Browser language setting (e.g., it-IT, en-US).';
COMMENT ON COLUMN analytics_events.created_date IS 'Timestamp when the record was created in the database.';

-- Commenti mancanti per altre tabelle (se necessario)

-- Commenti per colonne della tabella addresses senza note
COMMENT ON COLUMN addresses.timezone IS 'Timezone of the address location.';
COMMENT ON COLUMN addresses.latitude IS 'Latitude coordinate of the address.';
COMMENT ON COLUMN addresses.longitude IS 'Longitude coordinate of the address.';

-- Commenti per colonne della tabella migrations senza note
COMMENT ON COLUMN migrations.name IS 'Name or description of the migration.';
COMMENT ON TABLE migrations IS 'Tracks database schema migrations and their execution history.';