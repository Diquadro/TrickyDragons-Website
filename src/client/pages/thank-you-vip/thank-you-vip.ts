import '@client/layouts/layout_common/layout_common'
import './thank-you-vip.scss'
import { API, ENV } from '@shared/constants/app.constants'
import { Base64_Url } from '@shared/utils/base64_url'
import { get_timezone } from '@client/ts/timezone'
import { get_utm_params } from '@client/ts/utm_params'
;(function main() {
    handle_purchase_confirmation()
    handle_welcome_email()
})()

async function handle_welcome_email() {
    const email = get_email_from_url()

    if (!email) {
        console.warn('Missing email for welcome email')
        return
    }

    try {
        await send_vip_welcome_email({
            contact_email: email,
        })
        console.info('VIP welcome email sent successfully:', { email })
    } catch (error) {
        console.error('Failed to send VIP welcome email:', {
            email,
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

async function handle_purchase_confirmation() {
    const session_id = get_session_id_from_url()
    const email = get_email_from_url()

    if (!session_id || !email) {
        console.warn('Missing session_id or email in thank you page')
        return
    }

    try {
        // 1. Check payment status via Stripe session
        const session_status = await get_stripe_session_status(session_id)

        if (session_status.payment_status !== 'paid') {
            console.info('Payment not completed yet:', { session_id, status: session_status.payment_status })
            return
        }

        // 2. Send purchase confirmation to backend
        await confirm_purchase(email, session_id)

        // 3. Mark checkout as completed to prevent remove_from_cart events
        sessionStorage.setItem('checkout_completed', 'true')

        console.info('Purchase confirmed successfully:', { session_id, email })
    } catch (error) {
        console.error('Error confirming purchase:', {
            session_id,
            email,
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

function get_session_id_from_url(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('session_id')
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

async function get_stripe_session_status(session_id: string) {
    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.STRIPE.SESSION_STATUS}`
        : `${API.URL}${API.ENDPOINTS.STRIPE.SESSION_STATUS}`

    const response = await fetch(`${endpoint}?session_id=${session_id}`, {
        method: 'GET',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(`Failed to get session status: ${response.status}`)
    }

    return await response.json()
}

async function confirm_purchase(email: string, session_id: string) {
    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.CONTACTS.PURCHASE}`
        : `${API.URL}${API.ENDPOINTS.CONTACTS.PURCHASE}`

    const payload = {
        email,
        session_id,
        timezone: get_timezone(),
        utm_params: get_utm_params(),
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw new Error(`Failed to confirm purchase: ${response.status}`)
    }

    return await response.json()
}

async function send_vip_welcome_email(params: { contact_email: string }) {
    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.EMAILS.SEND_WELCOME_VIP}`
        : `${API.URL}${API.ENDPOINTS.EMAILS.SEND_WELCOME_VIP}`

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        throw new Error(`Failed to send VIP welcome email: ${response.status}`)
    }

    return await response.json()
}
