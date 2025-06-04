-- Creazione della tabella attributions per gestire i parametri UTM
CREATE TABLE attributions (
    uuid UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    created_by TEXT,
    created_date TIMESTAMPTZ,
    updated_by TEXT,
    updated_date TIMESTAMPTZ
);

-- Commento sulla tabella
COMMENT ON TABLE attributions IS 'Stores marketing attribution data including UTM parameters and referrer information for tracking campaign effectiveness.';

-- Commenti sulle colonne
COMMENT ON COLUMN attributions.uuid IS 'Universally unique identifier for the attribution record.';
COMMENT ON COLUMN attributions.utm_source IS 'UTM source parameter identifying the traffic source (e.g., google, facebook, newsletter).';
COMMENT ON COLUMN attributions.utm_medium IS 'UTM medium parameter identifying the marketing medium (e.g., cpc, email, social).';
COMMENT ON COLUMN attributions.utm_campaign IS 'UTM campaign parameter identifying the specific campaign name.';
COMMENT ON COLUMN attributions.utm_term IS 'UTM term parameter for paid search keywords.';
COMMENT ON COLUMN attributions.utm_content IS 'UTM content parameter for A/B testing and content-targeted ads.';
COMMENT ON COLUMN attributions.created_by IS 'User who created the record.';
COMMENT ON COLUMN attributions.created_date IS 'Timestamp when the record was created.';
COMMENT ON COLUMN attributions.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN attributions.updated_date IS 'Timestamp when the record was last updated.';

-- Aggiunta della colonna attribution_uuid alla tabella actions
ALTER TABLE actions 
ADD COLUMN attribution_uuid UUID;

-- Commento sulla nuova colonna
COMMENT ON COLUMN actions.attribution_uuid IS 'Reference to the attribution data associated with this action.';

-- Creazione dell'indice per la performance
CREATE INDEX idx_actions_attribution_uuid ON actions USING btree (attribution_uuid);

-- Creazione della foreign key constraint
ALTER TABLE actions 
ADD CONSTRAINT actions_attribution_uuid_fkey 
FOREIGN KEY (attribution_uuid) 
REFERENCES attributions(uuid) 
ON DELETE SET NULL;

-- Indici aggiuntivi per migliorare le query sui parametri UTM più comuni
CREATE INDEX idx_attributions_utm_source ON attributions USING btree (utm_source);
CREATE INDEX idx_attributions_utm_medium ON attributions USING btree (utm_medium);
CREATE INDEX idx_attributions_utm_campaign ON attributions USING btree (utm_campaign);