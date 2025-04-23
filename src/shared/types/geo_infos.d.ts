// Geographic information interface
export interface geo_infos {
    // IP address
    ip?: string
    // Country code
    country?: string
    // Region/state code
    region?: string
    // City name
    city?: string
    // Timezone
    timezone?: string
    // Latitude
    lat?: number
    // Longitude
    lon?: number
}

// Extends Express Request with geo information
declare global {
    namespace Express {
        interface Request {
            geo_infos?: geo_infos
        }
    }
}
