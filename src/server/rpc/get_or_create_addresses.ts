import Addresses from '@schemas/public/Addresses'
import { Geo_Infos } from '@server_middlewares/geo_infos.middlewares'
import { sql } from '@server_models/models'
import { try_catch } from '@server_utils/try_catch'

export async function get_or_create_addresses_connection(geo_infos: Geo_Infos[]) {
    const [ok, err, data] = await try_catch(get_or_create_addresses(geo_infos))
    if (!ok) {
        console.error(err)
        return []
    }

    return data
}

/**
 * Gets or creates addresses based on geographic information
 */
export async function get_or_create_addresses(geo_infos: Geo_Infos[]): Promise<Addresses[]> {
    // Handle empty input
    if (!geo_infos?.length) return []

    // Get existing addresses
    const found = await get_by_geo_infos(geo_infos)

    // Create lookup map for quick matching
    const address_map = new Map(found.map((addr) => [`${addr.city}|${addr.state}|${addr.country}`, addr]))

    // Collect addresses to create
    const to_create = []
    for (const info of geo_infos) {
        const key = `${info.city}|${info.region}|${info.country}`
        if (!address_map.has(key)) {
            to_create.push(info)
        }
    }
    const created = await create(to_create)

    return [...found, ...created]
}

/**
 * Find addresses by geographic information
 */
async function get_by_geo_infos(geo_infos: Geo_Infos[]): Promise<Addresses[]> {
    if (!geo_infos?.length) return []

    const conditions = geo_infos.map(
        (info) => sql`
        (city IS NOT DISTINCT FROM ${info.city}
        AND state IS NOT DISTINCT FROM ${info.region}
        AND country IS NOT DISTINCT FROM ${info.country})
    `,
    )

    return await sql<Addresses[]>`
        SELECT * FROM addresses
        WHERE (${sql.join(conditions, sql` OR `)})
    `
}

/**
 * Create new addresses
 */
async function create(geo_infos: Geo_Infos[]): Promise<Addresses[]> {
    const to_insert = geo_infos.map((info) => ({
        city: info.city,
        state: info.region,
        country: info.country,
    }))

    return await sql.insert<Addresses[]>('addresses', to_insert)
}
