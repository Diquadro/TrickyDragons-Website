import { API_URL } from '@shared/constants'

document.addEventListener('DOMContentLoaded', () => {
    const redirectLinks = document.querySelectorAll('.redirect_link')

    redirectLinks.forEach((link) => {
        link.addEventListener('click', (event: MouseEvent) => {
            event.preventDefault()

            const anchor = link as HTMLAnchorElement

            // Creazione dei dati da inviare al server
            const data = JSON.stringify({
                origin: 0, // Website
                event: 0, // Click
                redirect_url: anchor.href,
            })

            // Converti i dati in JSON e poi in URL-safe Base64
            const base64Data = btoa(data) // Base64 URL-safe

            fetch(`${API_URL}/redirect/${base64Data}`)

            window.location.href = anchor.href
        })
    })
})
