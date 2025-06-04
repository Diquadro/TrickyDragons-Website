import '@client/components/cta/cta.scss'
import '@client/components/cta_modal/cta_modal'
import posthog from 'posthog-js'

import error_toast from '@client/components/error_toast/error_toast'
import { show_spinner } from '@client/components/spinner/spinner'
import { show_modal } from '@client/components/cta_modal/cta_modal'
import {
    CONTACT_RESPONSE_OUTCOME,
    Subscribe_Contact_Request,
    Subscribe_Contact_Response,
    subscribe_contact_request_schema,
    subscribe_contact_response_schema,
} from '@shared/validations/subscribe_contact.validation'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { get_utm_params } from '@client/ts/utm_params'
import { get_timezone } from '@client/ts/timezone'
import { API, ENV } from '@shared/constants/app.constants'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import { track_custom_event } from '@client/ts/analytics_events'

const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * Subscribe contact to newsletter
 */
async function subscribe_contact(
    contact_data: Subscribe_Contact_Request,
): Promise<Subscribe_Contact_Response> {
    // Validate request data with Zod safeParse
    const request_validation = subscribe_contact_request_schema.safeParse(contact_data)

    if (!request_validation.success) {
        console.error('Subscribe contact request validation failed:', request_validation.error.issues)
        throw new Error('Invalid request data')
    }

    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.CONTACTS.SUBSCRIBE}`
        : `${API.URL}${API.ENDPOINTS.CONTACTS.SUBSCRIBE}`

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request_validation.data),
    })

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status} - ${await response.text()}`)
    }

    try {
        const json = await response.json()

        // Validate response data with Zod safeParse
        const response_validation = subscribe_contact_response_schema.safeParse(json)

        if (!response_validation.success) {
            console.error('Subscribe contact response validation failed:', response_validation.error.issues)
            throw new Error('Invalid response format')
        }

        return response_validation.data
    } catch (error) {
        throw new Error(`Invalid JSON response: ${await response.text()}`)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.cta > .button')

    buttons.forEach((button) => {
        button.addEventListener('click', handle_button_click())
    })
})

function handle_button_click() {
    return async (event: Event): Promise<void> => {
        event.preventDefault()

        const target = event.target as HTMLElement
        const cta_container = target.closest('.cta')

        if (!cta_container) return

        const email_input = cta_container.querySelector('input[type="email"]') as HTMLInputElement

        if (!email_input || !EMAIL_REGEX.test(email_input.value)) {
            error_toast('Invalid email!')
            return
        }
        const email = email_input.value.trim().toLowerCase()

        const consent_checkbox = cta_container.querySelector('input[type="checkbox"]') as HTMLInputElement

        if (!consent_checkbox || !consent_checkbox.checked) {
            error_toast('You must agree to the Privacy Policy.')
            return
        }

        show_spinner(true)

        try {
            const utm_params = get_utm_params()

            const result: Subscribe_Contact_Response = await subscribe_contact({
                email: email,
                subscription: ContactSubscriptions.newsletter,
                utm_params,
                timezone: get_timezone(),
            })

            if (!result || !result.data) {
                throw new Error('No contact found')
            } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED) {
                show_modal('modal_email_reactivated')
            } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED) {
                show_modal('modal_email_duplicate')
            } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.NEW_CONTACT) {
                window.umami?.track('subscribed_to_newsletter', { ...utm_params })
                posthog.capture('subscribed_to_newsletter')

                show_modal('modal_email_sent')
            }

            track_custom_event(AnalyticsEventName.subscribe_to_newsletter, {
                email: email,
                outcome: result.data.outcome,
                ...utm_params,
            })

            return
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.stack)
            }
            return error_toast('The dragons are sleeping now. Please try again later.')
        } finally {
            show_spinner(false)
            email_input.value = ''
            consent_checkbox.checked = false
        }
    }
}
