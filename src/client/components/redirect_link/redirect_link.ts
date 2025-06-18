import { track_custom_event } from '@client/ts/analytics_events'
import { get_utm_params } from '@client/ts/utm_params'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import posthog from 'posthog-js'

document.addEventListener('DOMContentLoaded', () => {
    const redirectLinks = document.querySelectorAll('.redirect_link')

    redirectLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault()

            const anchor = link as HTMLAnchorElement

            track_custom_event(AnalyticsEventName.link_click, { link: anchor.href, ...get_utm_params() })
            window.umami?.track(AnalyticsEventName.link_click, { link: anchor.href, ...get_utm_params() })
            posthog.capture(AnalyticsEventName.link_click, { link: anchor.href })

            window.location.href = anchor.href
        })
    })
})
