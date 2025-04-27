import '@client/components/cta/cta.scss'
import '@client/components/cta_modal/cta_modal'
import posthog from 'posthog-js'

import error_toast from '@client/components/error_toast/error_toast'
import { show_spinner } from '@client/components/spinner/spinner'
import { show_modal } from '@client/components/cta_modal/cta_modal'
import {
    CONTACT_RESPONSE_OUTCOME,
    Subscribe_Contacts_Response,
} from '@shared/validations/subscribe_contact.validations'
import { RPC } from '@client/ts/rpc'
import ContactSubscriptions from '@shared/schemas/public/ContactSubscriptions'

const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.cta > .button')

    buttons.forEach((button) => {
        button.addEventListener('click', handle_button_click())
    })
})

function handle_button_click() {
    return async (event: Event): Promise<void> => {
        event.preventDefault()

        const target = event.target as HTMLElement
        const cta_container = target.closest('.cta')

        if (!cta_container) return

        const email_input = cta_container.querySelector('input[type="email"]') as HTMLInputElement

        if (!email_input || !EMAIL_REGEX.test(email_input.value)) {
            error_toast('Invalid email!')
            return
        }
        const email = email_input.value.trim().toLowerCase()

        const consent_checkbox = cta_container.querySelector('input[type="checkbox"]') as HTMLInputElement

        if (!consent_checkbox || !consent_checkbox.checked) {
            error_toast('You must agree to the Privacy Policy.')
            return
        }

        show_spinner(true)

        try {
            const result: Subscribe_Contacts_Response = await RPC.subscribe_contacts({
                email: email,
                subscription: ContactSubscriptions.newsletter,
            })

            if (!result) {
                throw new Error('No contact found')
            } else if (result.outcome === CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED) {
                return show_modal('modal_email_reactivated')
            } else if (result.outcome === CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED) {
                return show_modal('modal_email_duplicate')
            } else if (result.outcome === CONTACT_RESPONSE_OUTCOME.NEW_CONTACT) {
                if (typeof window !== 'undefined' && typeof window.umami !== 'undefined') {
                    window.umami.track('subscribed_to_newsletter')
                }

                posthog.capture('subscribed_to_newsletter')

                return show_modal('modal_email_sent')
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.stack)
            }
            return error_toast('The dragons are sleeping now. Please try again later.')
        } finally {
            show_spinner(false)
            email_input.value = ''
            consent_checkbox.checked = false
        }
    }
}
