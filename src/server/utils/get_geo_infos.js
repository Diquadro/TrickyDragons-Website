import geoip from 'geoip-lite'
import countryRegionData from 'country-region-data/dist/data-umd.js'

export default function get_geo_infos(ip_address) {
    const geo_infos = geoip.lookup(ip_address)

    if (!geo_infos) return {}

    const country = countryRegionData?.find((c) => c.countryShortCode === geo_infos.country)
    const region = country?.regions.find((r) => r.shortCode === geo_infos.region)

    return {
        country: country?.countryName,
        region: region?.name,
        city: geo_infos.city,
        postal: geo_infos.postal,
    }
}
