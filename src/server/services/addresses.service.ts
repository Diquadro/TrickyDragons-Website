import { Request } from 'express'
import { sql } from '@server/models/postgres_client'
import Addresses, { AddressesInitializer } from '@shared/schemas/public/Addresses'

export abstract class Addresses_Service {
    static async get_or_create(req: Request): Promise<Addresses[]> {
        const city = req.geo_infos?.city ?? null
        const region = req.geo_infos?.region ?? null
        const country = req.geo_infos?.country ?? null

        const addresses = await sql<Addresses[]>`
            SELECT *
            FROM addresses
            WHERE city = ${city}
                AND region = ${region}
                AND country = ${country}
        `

        if (addresses.length > 0) {
            return addresses
        }

        const new_address: AddressesInitializer = {
            city: city,
            region: region,
            country: country,
        }

        return await sql.insert<Addresses[]>('addresses', [new_address])
    }
}
