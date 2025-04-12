import { API_URL } from '@shared/constants'

export class Emails {
    static async send_welcome(email: string) {
        return fetch(`${API_URL}/v1/emails/welcome`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ email }]),
        })
    }
}
