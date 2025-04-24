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
    const cleanIp = ip.replace(/^::ffff:/, '')

    // Only process valid IPs (skip localhost for development)
    if (cleanIp === '127.0.0.1' || cleanIp === '::1') {
        // For local development, use mock geo data
        req.geo_infos = {
            city: 'San Francisco',
            country: 'US',
            region: 'CA',
            timezone: 'America/Los_Angeles',
            ll: [37.7749, -122.4194],
        }
    } else {
        // Lookup IP in the geoip database
        const geo = geoip.lookup(cleanIp)

        if (!geo) return

        const country = countryRegionData?.find((c: any) => c.countryShortCode === geo.country)
        const region = country?.regions.find((r: any) => r.shortCode === geo.region)
        req.geo_infos = {
            country: country?.countryName || undefined,
            region: region?.name || undefined,
            city: geo.city || undefined,
            timezone: geo.timezone || undefined,
            ll: [geo.ll?.[0], geo.ll?.[1]],
        }
    }

    next()
}
