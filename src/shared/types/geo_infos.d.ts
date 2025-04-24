// Geographic information interface
export interface GeoIPResult {
    country?: string
    region?: string
    timezone?: string // IANA Time Zone format (e.g., Europe/Rome)
    city?: string
    ll?: [number, number] // [latitude, longitude]
    metro?: number // Optional metro code
    area?: number // Optional accuracy radius (km)
}

// Extends Express Request with geo information
declare global {
    namespace Express {
        interface Request {
            geo_infos?: geo_infos
        }
    }
}
