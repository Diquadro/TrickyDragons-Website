import { initialize_umami } from '@client/ts/umami'
import { initialize_meta_pixel } from '@client/ts/cookie_meta_pixel'
import { initialize_analytics } from '@client/ts/analytics_events'
import { initialize_screen_infos } from '@client/ts/screen_infos'
import { initialize_utm_params } from '@client/ts/utm_params'
import { initialize_posthog } from '@client/ts/posthog'
import { setupSmartLinkNavigation, resolveDefaultTargetUrl } from '@client/ts/link_interceptor'
import { track_custom_event } from '@client/ts/analytics_events'
import { get_utm_params } from '@client/ts/utm_params'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import posthog from 'posthog-js'

initialize_meta_pixel()
initialize_utm_params()
initialize_screen_infos()
initialize_analytics()
initialize_posthog()
initialize_umami()

// Global link tracking (exclude landing page and checkout which have their own logic)
;(function init_global_link_tracking() {
    const path = window.location.pathname
    if (path === '/' || path.startsWith('/checkout')) return

    setupSmartLinkNavigation({
        root: document,
        selector: 'a[href]',
        shouldPremergeHref: true,
        optOutDataAttr: 'noIntercept',
        resolveTargetUrl: resolveDefaultTargetUrl,
        beforeNavigate: ({ anchor, finalUrl, action }) => {
            const payload = {
                link: finalUrl.toString(),
                action,
                anchor_text: anchor.textContent?.trim() || null,
                ...get_utm_params(),
            }

            track_custom_event(AnalyticsEventName.link_click, payload)
            window.umami?.track(AnalyticsEventName.link_click, payload)
            posthog.capture(AnalyticsEventName.link_click, payload)
        },
    })
})()
