import posthog from 'posthog-js'
import error_toast from '@client/ts/error_toast'
import { show_spinner } from '@client/components/spinner/spinner'
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
import { SUBSCRIPTION_EVENT, SubscriptionEvent } from '@shared/constants/subscription-events.constants'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import { track_custom_event } from '@client/ts/analytics_events'
import { Base64_Url } from '@shared/utils/base64_url'

const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * Redirect to appropriate page based on event and reservation status
 */
function redirect_to_page(event: SubscriptionEvent, email?: string, has_reserved?: boolean) {
    const current_url = new URL(window.location.href)
    let target_url: URL

    // If user has already reserved, redirect to welcome-back page regardless of event
    if (has_reserved) {
        target_url = new URL('/welcome-back', current_url.origin)
    } else {
        target_url = new URL('/reservation', current_url.origin)
    }

    target_url.searchParams.set('event', event)

    // Add email in base64 if provided
    if (email) {
        const encoded_email = Base64_Url.encode(email)
        target_url.searchParams.set('email', encoded_email)
    }

    if (has_reserved) {
        target_url.searchParams.set('has_reserved', 'true')
    } else {
        target_url.searchParams.set('has_reserved', 'false')
    }

    // Preserve UTM parameters if they exist
    const utm_params = get_utm_params()
    Object.entries(utm_params).forEach(([key, value]) => {
        if (value) {
            target_url.searchParams.set(key, value)
        }
    })

    window.location.href = target_url.toString()
}

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
    // Initialize form handlers
    const forms = document.querySelectorAll('.cta-form')
    forms.forEach((form) => {
        form.addEventListener('submit', handle_form_submit)

        // Handle mobile keyboard covering input
        const email_input = form.querySelector('input[type="email"]') as HTMLInputElement
        if (email_input) {
            email_input.addEventListener('focus', handle_input_focus)
        }
    })

    // initIntersectionObserver()
})

/**
 * Scroll input into view when focused on mobile to prevent keyboard covering it
 */
function handle_input_focus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement

    // Only apply on touch devices (mobile/tablet)
    const is_touch_device = window.matchMedia('(pointer: coarse)').matches
    if (!is_touch_device) return

    // Small timeout to wait for mobile keyboard to open
    setTimeout(() => {
        const rect = input.getBoundingClientRect()
        const viewport_height = window.visualViewport?.height || window.innerHeight

        // Guard: don't scroll if input is still visible
        if (rect.bottom <= viewport_height) return

        input.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
        })
    }, 300)
}

async function handle_form_submit(event: Event): Promise<void> {
    event.preventDefault()

    const form = event.target as HTMLFormElement
    const cta_container = form.closest('.cta')

    if (!cta_container) return

    const email_input = form.querySelector('input[type="email"]') as HTMLInputElement

    if (!email_input || !EMAIL_REGEX.test(email_input.value)) {
        error_toast('Invalid email!')
        return
    }
    const email = email_input.value.trim().toLowerCase()

    // const consent_checkbox = form.querySelector('input[type="checkbox"]') as HTMLInputElement

    // if (!consent_checkbox || !consent_checkbox.checked) {
    //     error_toast('You must agree to the Privacy Policy.')
    //     return
    // }

    const name_input = form.querySelector('input.form_name') as HTMLInputElement
    if (name_input?.value) {
        console.log(name_input?.value)
        throw new Error('Name field should not be present in the form.')
    }

    show_spinner(true)

    try {
        const utm_params = get_utm_params()

        // Get A/B test variant from localStorage
        const stored_variant = localStorage.getItem('ab_test_hero_image')
        const ab_variant = stored_variant || undefined

        const result: Subscribe_Contact_Response = await subscribe_contact({
            email: email,
            subscription: ContactSubscriptions.newsletter,
            utm_params,
            timezone: get_timezone(),
            ab_variant,
        })

        if (!result || !result.data) {
            throw new Error('No contact found')
        } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED) {
            window.umami?.track('resubscribed', {
                ...utm_params,
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
            })
            posthog.capture('resubscribed', {
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
            })
            track_custom_event(AnalyticsEventName.subscribe_to_newsletter, {
                email: email,
                outcome: result.data.outcome,
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
                ...utm_params,
            })
            redirect_to_page(SUBSCRIPTION_EVENT.RESUBSCRIBED, email, result.data.has_reserved)
        } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED) {
            window.umami?.track('already-subscribed', {
                ...utm_params,
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
            })
            posthog.capture('already-subscribed', {
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
            })
            track_custom_event(AnalyticsEventName.subscribe_to_newsletter, {
                email: email,
                outcome: result.data.outcome,
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
                ...utm_params,
            })
            redirect_to_page(SUBSCRIPTION_EVENT.ALREADY_SUBSCRIBED, email, result.data.has_reserved)
        } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.NEW_CONTACT) {
            window.umami?.track('subscribed_to_newsletter', {
                ...utm_params,
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
            })
            posthog.capture('subscribed_to_newsletter', {
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
            })
            track_custom_event(AnalyticsEventName.subscribe_to_newsletter, {
                email: email,
                outcome: result.data.outcome,
                has_reserved: result.data.has_reserved,
                ab_test_variant: ab_variant,
                ...utm_params,
            })
            redirect_to_page(SUBSCRIPTION_EVENT.NEW_CONTACT, email, result.data.has_reserved)
        }

        email_input.value = ''
        // consent_checkbox.checked = false
        return
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.stack)
        }
        return error_toast('The dragons are sleeping now. Please try again later.')
    } finally {
        show_spinner(false)
    }
}

// Aggiungi questo script al tuo file JavaScript principale o in un nuovo file
function initIntersectionObserver() {
    // Controlla se siamo su mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (isMobile) {
        const submitButton = document.querySelector('.cta form button[type="submit"]')

        if (submitButton) {
            // Crea l'Intersection Observer
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // Elemento visibile nel 60% centrale
                            entry.target.classList.add('in-view')
                        } else {
                            // Elemento non più visibile nel 60% centrale
                            entry.target.classList.remove('in-view')
                        }
                    })
                },
                {
                    // Configurazione per il 60% centrale dello schermo
                    rootMargin: '-20% 0px -20% 0px', // 20% top + 20% bottom = 60% centrale
                    threshold: 0.1, // Triggera quando almeno il 10% dell'elemento è visibile
                },
            )

            // Inizia ad osservare il bottone
            observer.observe(submitButton)
        }
    }
}
