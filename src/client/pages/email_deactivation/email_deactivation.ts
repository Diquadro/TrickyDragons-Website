import { Base64_Url } from '@shared/utils/base64_url'
import './email_deactivation.scss'
import { API, ENV } from '@shared/constants/app.constants'
import {
    CONTACT_UNSUBSCRIBE_OUTCOME,
    unsubscribe_contact_request_schema,
} from '@shared/validations/unsubscribe_contact.validation'
import { get_timezone } from '@client/ts/timezone'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { track_custom_event } from '@client/ts/analytics_events'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'

// Send the unsubscribe request to the backend
async function unsubscribe(): Promise<void> {
    try {
        const params = new URLSearchParams(window.location.search)
        const data64 = params.get('data64')

        if (!data64) {
            throw new Error('No data64 found in query parameters.')
        }

        const data = Base64_Url.decode_json(data64)

        const request_validation = unsubscribe_contact_request_schema.safeParse({
            email: data.email,
            subscription: ContactSubscriptions.newsletter,
            utm_params: data.utm_params,
            timezone: get_timezone(),
        })

        if (!request_validation.success) {
            throw new Error('Invalid data.')
        }

        const endpoint = ENV.LOCAL
            ? `${API.ENDPOINTS.CONTACTS.UNSUBSCRIBE}`
            : `${API.URL}${API.ENDPOINTS.CONTACTS.UNSUBSCRIBE}`

        const response = await fetch(endpoint, {
            method: 'POST   ',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request_validation.data),
        })

        if (!response.ok) {
            throw new Error('Failed to unsubscribe.')
        }

        const response_data = await response.json()

        track_custom_event(AnalyticsEventName.unsubscribe_to_newsletter, {
            email: data.email,
            outcome: response_data.data.outcome,
            ...data.utm_params,
        })
    } catch (error) {
        console.error('An error occurred while unsubscribing:', error)
    }
}

unsubscribe()
