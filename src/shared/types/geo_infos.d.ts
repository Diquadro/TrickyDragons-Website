// Geographic information interface
export interface geo_infos {
    country?: string
    region?: string
    short_country?: string // ISO 3166-1 alpha-2 country code (e.g., IT, US)
    short_region?: string // Region/state short code (e.g., CA, TX, LOM)
    timezone?: string // IANA Time Zone format (e.g., Europe/Rome)
    city?: string
    latitude?: number // Latitude coordinate
    longitude?: number // Longitude coordinate
}

// Extends Express Request with geo information
declare global {
    namespace Express {
        interface Request {
            geo_infos?: geo_infos
        }
    }
}
