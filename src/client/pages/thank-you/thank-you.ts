import '@client/layouts/layout_common/layout_common'
import './thank-you.scss'
import { API, ENV } from '@shared/constants/app.constants'
import { Base64_Url } from '@shared/utils/base64_url'
;(function main() {
    handle_welcome_email()
})()

async function handle_welcome_email() {
    const email = get_email_from_url()

    if (!email) {
        console.warn('Missing email for welcome email')
        return
    }

    try {
        await send_non_vip_welcome_email({
            contact_email: email,
        })
        console.info('Non-VIP welcome email sent successfully:', { email })
    } catch (error) {
        console.error('Failed to send Non-VIP welcome email:', {
            email,
            error: error instanceof Error ? error.message : 'Unknown error',
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

async function send_non_vip_welcome_email(params: { contact_email: string }) {
    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.EMAILS.SEND_WELCOME_NON_VIP}`
        : `${API.URL}${API.ENDPOINTS.EMAILS.SEND_WELCOME_NON_VIP}`

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        throw new Error(`Failed to send Non-VIP welcome email: ${response.status}`)
    }

    return await response.json()
}
