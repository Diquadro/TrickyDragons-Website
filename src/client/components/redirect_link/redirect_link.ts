import posthog from 'posthog-js'

document.addEventListener('DOMContentLoaded', () => {
    const redirectLinks = document.querySelectorAll('.redirect_link')

    redirectLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault()

            const anchor = link as HTMLAnchorElement

            if (typeof window !== 'undefined' && typeof window.umami !== 'undefined') {
                window.umami.track('link_clicked', { link: anchor.href })
            }

            posthog.capture('link_clicked', { link: anchor.href })

            window.location.href = anchor.href
        })
    })
})
