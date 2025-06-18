import { Request, Response, NextFunction } from 'express'
import geoip from 'geoip-lite'
// @ts-ignore
import countryRegionData from 'country-region-data/dist/data-umd.js'

// Middleware that extracts geographic information from the client's IP
// Adds a geo_infos object to the request
export const geo_info_middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Get the client IP from the request-ip middleware
    const ip = req.clientIp || req.ip

    if (!ip) {
        next()
        return
    }

    // Clean the IP (remove IPv6 prefix if present)
    const clean_ip = ip.replace(/^::ffff:/, '')

    // Only process valid IPs (skip localhost for development)
    if (clean_ip === '127.0.0.1' || clean_ip === '::1') {
        // For local development, use mock geo data
        req.geo_infos = {
            city: 'San Francisco',
            country: 'US',
            region: 'CA',
            short_country: 'US', // Meta format: ISO 3166-1 alpha-2
            short_region: 'CA', // Meta format: state/region code
            timezone: 'America/Los_Angeles',
            latitude: 37.7749,
            longitude: -122.4194,
        }
    } else {
        // Lookup IP in the geoip database
        const geo = geoip.lookup(clean_ip)

        if (!geo) {
            next()
            return
        }

        const country = countryRegionData?.find((c: any) => c.countryShortCode === geo.country)
        const region = country?.regions.find((r: any) => r.shortCode === geo.region)
        req.geo_infos = {
            country: country?.countryName || undefined,
            region: region?.name || undefined,
            short_country: geo.country || undefined, // ISO 3166-1 alpha-2 from geoip
            short_region: geo.region || undefined, // State/region short code from geoip
            city: geo.city || undefined,
            timezone: geo.timezone || undefined,
            latitude: geo.ll?.[0] || undefined,
            longitude: geo.ll?.[1] || undefined,
        }
    }

    next()
}
