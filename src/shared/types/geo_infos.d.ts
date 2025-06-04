// Geographic information interface
export interface geo_infos {
    country?: string
    region?: string
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
