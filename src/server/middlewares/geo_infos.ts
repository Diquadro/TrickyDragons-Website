import { Request, Response, NextFunction } from 'express'
import geoip from 'geoip-lite'
import { geo_infos } from '@shared/types/geo_infos'

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
        }
    } else {
        // Lookup IP in the geoip database
        const geo = geoip.lookup(cleanIp)

        if (geo) {
            req.geo_infos = {
                city: geo.city,
                country: geo.country,
                region: geo.region,
                timezone: geo.timezone,
            }
        }
    }

    next()
}
