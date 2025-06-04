-- Enum per i tipi di eventi analytics
CREATE TYPE analytics_event_name AS ENUM (
    'page_view',
    'page_leave',
    'page_scroll',
    'link_click',
    'subscribe_to_newsletter',
    'unsubscribe_to_newsletter'
);

-- Creazione della tabella analytics_events per utenti anonimi
CREATE TABLE analytics_events (
    uuid UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Identificazione sessione (anonima)
    session_id TEXT NOT NULL,
    visitor_id TEXT, -- fingerprint o hash anonimo del browser
    
    -- Dati dell'evento
    event_name analytics_event_name NOT NULL,
    
    -- Dati della pagina (denormalizzati per performance)
    page_url TEXT NOT NULL,
    page_title TEXT,
    page_referrer TEXT,
    
    -- Dati UTM (denormalizzati - possono essere NULL se non presenti)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Dati del browser/device (denormalizzati)
    user_agent TEXT,
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    
    -- Dati geografici (denormalizzati per performance)
    country TEXT,
    region TEXT,
    city TEXT,
    timezone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Dati tecnici
    screen_resolution TEXT, -- es: '1920x1080'
    viewport_size TEXT, -- es: '1440x900'
    language TEXT, -- es: 'it-IT'
    
    -- Timestamp
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Campi di audit minimi (no created_by/updated_by per anonimi)
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commento sulla tabella
COMMENT ON TABLE analytics_events IS 'Stores anonymous analytics events with denormalized data for high-volume tracking and fast aggregations.';

-- Commenti sulle colonne principali
COMMENT ON COLUMN analytics_events.uuid IS 'Universally unique identifier for the analytics event.';
COMMENT ON COLUMN analytics_events.session_id IS 'Anonymous session identifier (e.g., generated client-side hash) - unique per browser session.';
COMMENT ON COLUMN analytics_events.visitor_id IS 'Anonymous visitor fingerprint for cross-session tracking - persists across sessions for same device/browser.';
COMMENT ON COLUMN analytics_events.event_name IS 'Type of analytics event being tracked.';
COMMENT ON COLUMN analytics_events.page_url IS 'Full URL of the page where the event occurred.';
COMMENT ON COLUMN analytics_events.page_referrer IS 'Referrer URL that brought the user to this page.';
COMMENT ON COLUMN analytics_events.occurred_at IS 'Timestamp when the event actually occurred (can be different from created_date for batch processing).';

-- Indici ottimizzati per analytics e time-series queries
CREATE INDEX idx_analytics_events_occurred_at ON analytics_events USING btree (occurred_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events USING btree (session_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events USING btree (event_name);
CREATE INDEX idx_analytics_events_page_url ON analytics_events USING btree (page_url);

-- Indici compositi per query comuni di analytics
CREATE INDEX idx_analytics_events_name_time ON analytics_events USING btree (event_name, occurred_at DESC);
CREATE INDEX idx_analytics_events_url_time ON analytics_events USING btree (page_url, occurred_at DESC);
CREATE INDEX idx_analytics_events_session_time ON analytics_events USING btree (session_id, occurred_at DESC);

-- Indici per UTM tracking
CREATE INDEX idx_analytics_events_utm_source ON analytics_events USING btree (utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_analytics_events_utm_campaign ON analytics_events USING btree (utm_campaign) WHERE utm_campaign IS NOT NULL;

-- Indici per geo analytics
CREATE INDEX idx_analytics_events_country ON analytics_events USING btree (country) WHERE country IS NOT NULL;
CREATE INDEX idx_analytics_events_device ON analytics_events USING btree (device_type) WHERE device_type IS NOT NULL;

-- Rimosso: Indice per event_data (campo eliminato)