import { API } from '@shared/constants/app.constants'
import { Base64_Url } from '@shared/utils/base64_url'

document.addEventListener('DOMContentLoaded', () => {
    const redirectLinks = document.querySelectorAll('.redirect_link')

    redirectLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault()

            const anchor = link as HTMLAnchorElement

            // Creazione dei dati da inviare al server
            const data = JSON.stringify({
                origin: 'Website',
                redirect_url: anchor.href,
            })

            const base64_data = Base64_Url.encode_json(data)

            fetch(`${API.URL}/redirect/${base64_data}`)

            window.location.href = anchor.href
        })
    })
})
