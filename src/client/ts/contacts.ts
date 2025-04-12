import { API_URL } from '@shared/constants'

export class Contacts {
    static async create(email: string) {
        return fetch(`${API_URL}/v1/contacts/status/lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ email }]),
        })
    }

    static async subscribe_newsletter(email: string) {
        return fetch(`${API_URL}/v1/contacts/subscriptions/newsletter`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ email }]),
        })
    }
}
