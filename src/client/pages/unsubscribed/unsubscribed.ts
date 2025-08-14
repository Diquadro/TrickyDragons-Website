import '@client/layouts/layout_common/layout_common'
import './unsubscribed.scss'
import posthog from 'posthog-js'
import { Base64_Url } from '@shared/utils/base64_url'
import { redirect_payload_schema } from '@shared/validations/redirect.validation'
import { API, ENV } from '@shared/constants/app.constants'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { track_custom_event } from '@client/ts/analytics_events'
import { get_utm_params } from '@client/ts/utm_params'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import {
    unsubscribe_contact_request_schema,
    type Unsubscribe_Contact_Response,
} from '@shared/validations/unsubscribe_contact.validation'

// Process unsubscription when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get data64 from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const data64 = urlParams.get('data64')

        if (!data64) {
            console.warn('No data64 parameter found, skipping unsubscription')
            return
        }

        // Decode the payload
        const payload = Base64_Url.decode_json(data64)
        const validatedPayload = redirect_payload_schema.parse(payload)

        if (!validatedPayload.email) {
            console.error('No email found in payload')
            return
        }

        // Call the unsubscribe API
        const result = await unsubscribeContact(validatedPayload.email, validatedPayload.utm_params)

        if (result.success) {
            // Track successful unsubscription
            const outcome = result.data?.outcome || 'success'

            // Custom analytics tracking
            await track_custom_event(AnalyticsEventName.unsubscribe_to_newsletter, {
                outcome,
                redirect_utm_params: validatedPayload.utm_params,
            })

            // Umami tracking
            window.umami?.track('unsubscribed_from_newsletter', {
                ...validatedPayload.utm_params,
                outcome,
            })

            // PostHog tracking
            posthog.capture('unsubscribed_from_newsletter', {
                outcome,
            })
        }
    } catch (error) {
        console.error('Error processing unsubscription:', error)
    }
})

async function unsubscribeContact(email: string, utm_params?: any): Promise<Unsubscribe_Contact_Response> {
    try {
        // Validate request body before sending
        const requestBody = unsubscribe_contact_request_schema.parse({
            email,
            subscription: ContactSubscriptions.newsletter,
            utm_params: get_utm_params(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })

        const endpoint = ENV.LOCAL
            ? `${API.ENDPOINTS.CONTACTS.UNSUBSCRIBE}`
            : `${API.URL}${API.ENDPOINTS.CONTACTS.UNSUBSCRIBE}`

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        const result = await response.json()
        return result
    } catch (error) {
        console.error('API call failed:', error)
        return {
            success: false,
            message: 'Network error occurred',
        }
    }
}
