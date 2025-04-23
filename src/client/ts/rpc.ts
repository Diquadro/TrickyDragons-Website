import {
    Subscribe_Contacts_Request,
    Subscribe_Contacts_Response,
    subscribe_contacts_response_schema,
} from '@shared/validations/subscribe_contact.validations'
import { API } from '@shared/constants/app.constants'

export class RPC {
    static async subscribe_contacts(
        contacts: Subscribe_Contacts_Request,
    ): Promise<Subscribe_Contacts_Response> {
        const response = await fetch(`${API.ENDPOINTS.CONTACTS.SUBSCRIBE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contacts),
        })

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status} - ${await response.text()}`)
        }

        const json = await response.json()
        return subscribe_contacts_response_schema.parse(json)
    }
}
