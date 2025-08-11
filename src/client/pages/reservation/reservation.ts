import './reservation.scss'
import { get_utm_params } from '@client/ts/utm_params'
import { get_timezone } from '@client/ts/timezone'
import { Base64_Url } from '@shared/utils/base64_url'
import { API, ENV } from '@shared/constants/app.constants'
;(function main() {
    main_button_handler()
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
