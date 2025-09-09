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

// Meta Pixel può rimanere subito (è critico per ads)
initialize_meta_pixel()

// Ritarda tutto il resto fino a dopo LCP
function initializeAnalyticsAfterLCP() {
    // Usa requestIdleCallback per non bloccare il main thread
    const initAnalytics = () => {
        initialize_utm_params()
        initialize_screen_infos()
        initialize_analytics()
        initialize_posthog()
        initialize_umami()
        initGlobalLinkTracking()
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(initAnalytics, { timeout: 2000 })
    } else {
        setTimeout(initAnalytics, 1000)
    }
}

// Aspetta che la pagina sia completamente caricata
if (document.readyState === 'complete') {
    initializeAnalyticsAfterLCP()
} else {
    window.addEventListener('load', initializeAnalyticsAfterLCP)
}

function initGlobalLinkTracking() {
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

            // Verifica che i servizi siano inizializzati prima di usarli
            if (typeof track_custom_event === 'function') {
                track_custom_event(AnalyticsEventName.link_click, payload)
            }
            if (window.umami?.track) {
                window.umami.track(AnalyticsEventName.link_click, payload)
            }
            if (posthog.capture) {
                posthog.capture(AnalyticsEventName.link_click, payload)
            }
        },
    })
}
