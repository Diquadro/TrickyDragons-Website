import Addresses from '@schemas/public/Addresses'
import { GeoInfos } from '@server_middlewares/geo_infos.middlewares'
import { sql } from '@server_models/models'
import { RowList } from 'postgres'
import { custom_error, VALIDATION_ERROR } from '@server_utils/custom_errors'

export class Addresses_Services {
    static async get_by_geo_infos(geo_infos: GeoInfos) {
        return await sql<Addresses[]>`
            SELECT *
            FROM addresses
            WHERE
                city IS NOT DISTINCT FROM ${geo_infos.city}
                AND state IS NOT DISTINCT FROM ${geo_infos.region}
                AND country IS NOT DISTINCT FROM ${geo_infos.country}
            LIMIT 1
        `
    }

    static async create_from_geo_infos(geo_infos: GeoInfos) {
        const address: Partial<Addresses> = {
            city: geo_infos.city,
            state: geo_infos.region,
            country: geo_infos.country,
        }

        return (await sql.insert('addresses', [address])) as RowList<Addresses[]>
    }

    static async get_or_create(geo_infos: GeoInfos | undefined) {
        if (!geo_infos) {
            throw custom_error(VALIDATION_ERROR)
        }

        const found = await this.get_by_geo_infos(geo_infos)
        return found.length > 0 ? found : await this.create_from_geo_infos(geo_infos)
    }
}
