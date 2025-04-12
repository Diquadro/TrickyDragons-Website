import base64url from 'base64url'
import { Redirects_Helpers } from '../helpers/redirects.helpers'
import { custom_error, VALIDATION_ERROR } from '@server_utils/custom_errors'

export class Redirects_Services {
    static decode_data(encoded_data: string) {
        const decoded_data = base64url.decode(encoded_data)
        const data = JSON.parse(decoded_data)

        const validation = Redirects_Helpers.validate_data64(data)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        return data
    }
}
