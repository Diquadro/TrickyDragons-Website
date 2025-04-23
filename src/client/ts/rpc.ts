import {
    Subscribe_Contacts_Request,
    Subscribe_Contacts_Response,
    subscribe_contacts_response_schema,
} from '@shared/validations/subscribe_contact.validations'
import { API, ENV } from '@shared/constants/app.constants'

export class RPC {
    static async subscribe_contacts(
        contacts: Subscribe_Contacts_Request,
    ): Promise<Subscribe_Contacts_Response> {
        const endpoint = ENV.LOCAL
            ? `${API.ENDPOINTS.CONTACTS.SUBSCRIBE}`
            : `${API.URL}${API.ENDPOINTS.CONTACTS.SUBSCRIBE}`

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contacts),
        })

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status} - ${await response.text()}`)
        }

        try {
            const json = await response.json()
            return subscribe_contacts_response_schema.parse(json)
        } catch (error) {
            throw new Error(`Invalid JSON response: ${await response.text()}`)
        }
    }
}
