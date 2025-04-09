import './email_deactivation.scss'

import { API_URL } from '@shared/constants'

// Extract the email from the URL's query parameters
function getEmailFromQuery(): string | null {
    const params = new URLSearchParams(window.location.search)
    return params.get('email') || null
}

// Send the unsubscribe request to the backend
async function unsubscribe(email: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/email_deactivation/${email}`)
        if (response.ok) {
            console.log('Unsubscribe request sent successfully.')
        } else {
            console.error('Failed to unsubscribe:', await response.text())
        }
    } catch (error) {
        console.error('An error occurred while unsubscribing:', error)
    }
}

// Main function to handle the unsubscribe process
;(async function main() {
    const email = getEmailFromQuery()
    if (email) {
        await unsubscribe(email)
    } else {
        console.error('No email found in query parameters.')
    }
})()
