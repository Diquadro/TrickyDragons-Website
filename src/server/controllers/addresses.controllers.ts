import { Geo_Infos } from '@server_middlewares/geo_infos.middlewares'
import { Addresses_Services } from '@server_services/addresses.services'
import { try_catch } from '@server_utils/try_catch'

export class Addresses_Controllers {
    static async internal(geo_infos: Geo_Infos) {
        const [addresses_ok, addresses_err, addresses] = await try_catch(
            Addresses_Services.get_or_create(geo_infos),
        )
    }
}
