import geoip from 'geoip-lite'
import { Request, Response, NextFunction } from 'express'
// @ts-ignore
import countryRegionData from 'country-region-data/dist/data-umd.js'

export type GeoInfos = {
    country: string | null
    region: string | null
    city: string | null
}

declare global {
    namespace Express {
        interface Request {
            geo_infos?: GeoInfos
        }
    }
}

export function geo_infos(req: Request, res: Response, next: NextFunction): void {
    const ip = req.clientIp
    const _geo = geoip.lookup(ip)

    if (_geo) {
        const country = countryRegionData?.find((c: any) => c.countryShortCode === _geo.country)
        const region = country?.regions.find((r: any) => r.shortCode === _geo.region)
        req.geo_infos = {
            country: country?.countryName,
            region: region?.name,
            city: _geo.city,
        }
    } else {
        req.geo_infos = { country: null, region: null, city: null }
    }

    next()
}
