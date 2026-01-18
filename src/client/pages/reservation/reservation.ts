import '@client/layouts/layout_common/layout_common'
import './reservation.scss'
import { get_utm_params } from '@client/ts/utm_params'
import { get_timezone } from '@client/ts/timezone'
import { Base64_Url } from '@shared/utils/base64_url'
import { API, ENV } from '@shared/constants/app.constants'
import { SUBSCRIPTION_EVENT } from '@shared/constants/subscription-events.constants'
import posthog from 'posthog-js'
import { track_custom_event } from '@client/ts/analytics_events'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
;(function main() {
    main_button_handler()
    secondary_button_handler()
})()

function main_button_handler() {
    const main_button = document.querySelector('.cta-main-button')
    if (!main_button) return

    main_button.addEventListener(
        'click',
        (e) => {
            const target = e.target as Element | null
            const anchor = target?.closest('.cta-main-button a') as HTMLAnchorElement | null
            if (!anchor) return

            const endpoint = ENV.LOCAL
                ? `${API.ENDPOINTS.CONTACTS.ADD_TO_CART}`
                : `${API.URL}${API.ENDPOINTS.CONTACTS.ADD_TO_CART}`

            try {
                const email = get_email_from_url()
                if (!email) return
                const payload = { email, timezone: get_timezone(), utm_params: get_utm_params() }

                // Track add_to_cart event on analytics platforms
                track_add_to_cart_event(email)

                if (navigator.sendBeacon) {
                    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
                    navigator.sendBeacon(endpoint, blob)
                } else {
                    fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        keepalive: true,
                        credentials: 'omit',
                    }).catch(() => {})
                }
            } catch {}
        },
        { capture: true },
    )
}

function secondary_button_handler() {
    const secondary_button = document.querySelector('.cta-secondary-button')
    if (!secondary_button) return

    const event = get_event_from_url()

    // If event is not 'new-contact', redirect secondary button to welcome-back page
    if (event && event !== SUBSCRIPTION_EVENT.NEW_CONTACT) {
        secondary_button.childNodes.forEach((child) => {
            if (child instanceof HTMLAnchorElement) {
                child.href = '/welcome-back'
            }
        })
    }
}

function get_email_from_url(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    const emailFromUrl = urlParams.get('email')
    if (!emailFromUrl) return null
    try {
        return Base64_Url.decode(emailFromUrl)
    } catch {
        return null
    }
}

/**
 * Track add_to_cart event when user clicks the main CTA button
 */
function track_add_to_cart_event(email: string) {
    try {
        const utm_params = get_utm_params()

        // Get A/B test variant from localStorage
        const stored_variant = localStorage.getItem('ab_hero_variant')
        const ab_variant = stored_variant ? `hero_test_${stored_variant}` : undefined

        // PostHog tracking
        posthog.capture('add_to_cart', {
            email,
            ab_test_variant: ab_variant,
        })

        // Umami tracking
        window.umami?.track('add_to_cart', {
            email,
            ab_test_variant: ab_variant,
            ...utm_params,
        })

        // Internal analytics tracking
        track_custom_event(AnalyticsEventName.add_to_cart, {
            email,
            ab_test_variant: ab_variant,
            ...utm_params,
        })
    } catch (error) {
        console.error('Error tracking add_to_cart:', error)
    }
}

function get_event_from_url(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('event')
}
