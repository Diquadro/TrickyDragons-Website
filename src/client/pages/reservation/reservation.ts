import './reservation.scss'
import '@client/components/redirect_link/redirect_link'

/**
 * Redirect to specified page preserving all URL parameters
 */
function redirect_with_params(page: string) {
    const current_url = new URL(window.location.href)
    const target_url = new URL(`/${page}`, current_url.origin)

    // Preserve all current URL parameters
    current_url.searchParams.forEach((value, key) => {
        target_url.searchParams.set(key, value)
    })

    window.location.href = target_url.toString()
}

document.addEventListener('DOMContentLoaded', () => {
    // Handle CTA main button click (redirect to checkout)
    const cta_main_button = document.querySelector('.cta-main-button')
    if (cta_main_button) {
        cta_main_button.addEventListener('click', () => {
            redirect_with_params('checkout')
        })
    }

    // Handle CTA secondary button click (redirect to thank-you)
    const cta_secondary_button = document.querySelector('.cta-secondary-button')
    if (cta_secondary_button) {
        cta_secondary_button.addEventListener('click', () => {
            redirect_with_params('thank-you')
        })
    }
})
