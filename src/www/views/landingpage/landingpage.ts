import site_access from '../../scripts/api/site_access'
import { API_URL } from '../../scripts/costants'
import cta from './components/cta/cta'
import cta_modal from './components/cta_modal/cta_modal'

document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to the Tricky Dragons™ World')

    site_access(API_URL)
    cta(API_URL)
    cta_modal()
    handle_redirect()
})

function handle_redirect() {
    const redirectLinks = document.querySelectorAll('.redirect_link')

    redirectLinks.forEach((link) => {
        link.addEventListener('click', async (event: MouseEvent) => {
            event.preventDefault()

            const anchor = link as HTMLAnchorElement

            // Creazione dei dati da inviare al server
            const data = JSON.stringify({
                origin: 0,
                event: 0, // Tipo di evento, ad esempio un click
                redirect_url: anchor.href,
            })

            // Converti i dati in JSON e poi in URL-safe Base64
            const base64Data = btoa(data) // Base64 URL-safe

            fetch(`${API_URL}/redirect/${base64Data}`).catch((error) => {
                console.error('Errore nel redirect:', error)
            })

            window.location.href = anchor.href
        })
    })
}
