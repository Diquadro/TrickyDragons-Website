import { get_utm_params } from '@client/ts/get_utm_params'
import { umami_track } from '@client/ts/umami_track'
import posthog from 'posthog-js'

document.addEventListener('DOMContentLoaded', () => {
    const redirectLinks = document.querySelectorAll('.redirect_link')

    redirectLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault()

            const anchor = link as HTMLAnchorElement

            umami_track('subscribed_to_newsletter', {
                ...get_utm_params(),
            })

            posthog.capture('link_clicked', { link: anchor.href })

            window.location.href = anchor.href
        })
    })
})
