// @ts-nocheck
import * as CookieConsent from 'vanilla-cookieconsent'

export function initialize_meta_pixel() {
    // Avoid multiple initializations
    if (window.fbq) return

    if (/*CookieConsent.acceptedCategory('marketing') &&*/ true) {
        // Standard Meta Pixel initialization code
        !(function (f, b, e, v, n, t, s) {
            if (f.fbq) return
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            }
            if (!f._fbq) f._fbq = n
            n.push = n
            n.loaded = !0
            n.version = '2.0'
            n.queue = []
            t = b.createElement(e)
            t.async = !0
            t.src = v
            s = b.getElementsByTagName(e)[0]
            s.parentNode.insertBefore(t, s)
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

        // Disable automatic form tracking and other automatic events
        fbq('set', 'autoConfig', false, process.env.META_PIXEL_ID)
        fbq('set', 'automaticMatching', false)

        // Initialize pixel
        fbq('init', process.env.META_PIXEL_ID)

        // Send a single PageView to generate the _fbp cookie
        // This is necessary for proper server-side event tracking
        fbq('track', 'PageView')
    }
}
