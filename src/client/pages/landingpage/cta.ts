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
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import { track_custom_event } from '@client/ts/analytics_events'
import {
    Get_Subscriber_Count_Response,
    get_subscriber_count_response_schema,
} from '@shared/validations/get_subscriber_count.validation'

const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// Global variable to track subscription status (resets on page refresh)
let user_has_subscribed = false

/**
 * Redirect to thank-you page with event parameter
 */
function redirect_to_thank_you(event: string) {
    const current_url = new URL(window.location.href)
    const thank_you_url = new URL('/thank-you', current_url.origin)
    thank_you_url.searchParams.set('event', event)

    // Preserve UTM parameters if they exist
    const utm_params = get_utm_params()
    Object.entries(utm_params).forEach(([key, value]) => {
        if (value) {
            thank_you_url.searchParams.set(key, value)
        }
    })

    window.location.href = thank_you_url.toString()
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

/**
 * Get subscriber count from API
 */
async function get_subscriber_count(): Promise<Get_Subscriber_Count_Response> {
    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.CONTACTS.SUBSCRIBER_COUNT}`
        : `${API.URL}${API.ENDPOINTS.CONTACTS.SUBSCRIBER_COUNT}`

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status} - ${await response.text()}`)
    }

    try {
        const json = await response.json()

        // Validate response data with Zod safeParse
        const response_validation = get_subscriber_count_response_schema.safeParse(json)

        if (!response_validation.success) {
            console.error(
                'Get subscriber count response validation failed:',
                response_validation.error.issues,
            )
            throw new Error('Invalid response format')
        }

        return response_validation.data
    } catch (error) {
        throw new Error(`Invalid JSON response: ${await response.text()}`)
    }
}

/**
 * Animate number from 0 to target value
 */
function animate_number(element: HTMLElement, target: number, duration: number = 2000) {
    const start = 0
    const startTime = performance.now()

    function update(currentTime: number) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = Math.floor(start + (target - start) * easeOut)

        element.textContent = current.toString()

        if (progress < 1) {
            requestAnimationFrame(update)
        } else {
            element.textContent = target.toString()
        }
    }

    requestAnimationFrame(update)
}

/**
 * Initialize subscriber count animation when element comes into view
 */
function init_subscriber_count_animation() {
    const subscriber_count_elements = document.querySelectorAll('.subscriber-count')

    subscriber_count_elements.forEach((element) => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !element.hasAttribute('data-animated')) {
                        element.setAttribute('data-animated', 'true')

                        // Check if success message is already visible
                        const success_message = element.parentElement?.querySelector('.success-message')
                        const should_animate =
                            !success_message || success_message.classList.contains('hidden')

                        // Fetch and animate subscriber count
                        get_subscriber_count()
                            .then((response) => {
                                const target = response.data.count
                                element.setAttribute('data-target', target.toString())

                                if (should_animate) {
                                    animate_number(element as HTMLElement, target)
                                } else {
                                    // Just set the number without animation to avoid flickering
                                    element.textContent = target.toString()
                                }
                            })
                            .catch((error) => {
                                console.error('Failed to fetch subscriber count:', error)
                                // Fallback to a default number if API fails
                                const fallback = 300
                                element.setAttribute('data-target', fallback.toString())

                                if (should_animate) {
                                    animate_number(element as HTMLElement, fallback)
                                } else {
                                    // Just set the number without animation to avoid flickering
                                    element.textContent = fallback.toString()
                                }
                            })
                    }
                })
            },
            { threshold: 0.1 },
        )

        observer.observe(element)
    })
}

/**
 * Check if user has already subscribed and show success message
 */
function check_and_show_subscription_status() {
    if (user_has_subscribed) {
        // Show success message in all CTAs
        const success_messages = document.querySelectorAll('.success-message')
        success_messages.forEach((message) => {
            message.classList.remove('hidden')
        })
    }
}

/**
 * Mark user as subscribed
 */
function mark_user_as_subscribed() {
    user_has_subscribed = true

    // Show success message in all CTAs on the page
    const success_messages = document.querySelectorAll('.success-message')
    success_messages.forEach((message) => {
        message.classList.remove('hidden')
    })
}

document.addEventListener('DOMContentLoaded', () => {
    // Check subscription status on page load
    check_and_show_subscription_status()

    // Initialize subscriber count animation
    init_subscriber_count_animation()

    // Initialize form handlers
    const forms = document.querySelectorAll('.cta-form')
    forms.forEach((form) => {
        form.addEventListener('submit', handle_form_submit)
    })
})

async function handle_form_submit(event: Event): Promise<void> {
    event.preventDefault()

    const form = event.target as HTMLFormElement
    const cta_container = form.closest('.cta')

    if (!cta_container) return

    const email_input = form.querySelector('input[type="email"]') as HTMLInputElement
    const success_message = cta_container.querySelector('.success-message') as HTMLElement

    if (!email_input || !EMAIL_REGEX.test(email_input.value)) {
        error_toast('Invalid email!')
        return
    }
    const email = email_input.value.trim().toLowerCase()

    const consent_checkbox = form.querySelector('input[type="checkbox"]') as HTMLInputElement

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
            window.umami?.track('resubscribed', { ...utm_params })
            posthog.capture('resubscribed')
            redirect_to_thank_you('resubscribed')
        } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED) {
            window.umami?.track('already-subscribed', { ...utm_params })
            posthog.capture('already-subscribed')
            redirect_to_thank_you('already-subscribed')
        } else if (result.data.outcome === CONTACT_RESPONSE_OUTCOME.NEW_CONTACT) {
            window.umami?.track('subscribed_to_newsletter', { ...utm_params })
            posthog.capture('subscribed_to_newsletter')
            track_custom_event(AnalyticsEventName.subscribe_to_newsletter, {
                email: email,
                outcome: result.data.outcome,
                ...utm_params,
            })
            redirect_to_thank_you('new-contact')
        }

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
