import '@client_components/cta/cta.scss'
import '@client_components/cta_modal/cta_modal'

import error_toast from '@client_components/error_toast/error_toast'
import { show_spinner } from '@client_components/spinner/spinner'
import { show_modal } from '@client_components/cta_modal/cta_modal'
import { Contacts } from '@client_ts/contacts'
import { Emails } from '@client_ts/emails'

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
        const email = email_input.value.trim()

        const consent_checkbox = cta_container.querySelector('input[type="checkbox"]') as HTMLInputElement

        if (!consent_checkbox || !consent_checkbox.checked) {
            error_toast('You must agree to the Privacy Policy.')
            return
        }

        show_spinner(true)

        try {
            const contact_created = await Contacts.create(email)
            const contacts_subscribed = await Contacts.subscribe_newsletter(email)

            if (!contact_created.ok && contacts_subscribed.ok) {
                return show_modal('modal_email_reactivated')
            } else if (!contact_created.ok && !contacts_subscribed.ok && contacts_subscribed.status === 409) {
                return show_modal('modal_email_duplicate')
            } else if (!contact_created.ok && !contacts_subscribed.ok) {
                error_toast('Something went wrong. Please try again later.')
            }

            await Emails.send_welcome(email)
            return show_modal('modal_email_sent')
        } catch (err) {
            return error_toast('The dragons are sleeping now. Please try again later.')
        } finally {
            show_spinner(false)
            email_input.value = ''
            consent_checkbox.checked = false
        }
    }
}
