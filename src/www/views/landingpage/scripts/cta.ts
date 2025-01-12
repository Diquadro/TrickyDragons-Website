import send_email from '../../../scripts/api/send_email'
import error_toast from '../../../scripts/error_toast'
import { show_modal } from './cta_modal'

const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function (API_URL: string): void {
    const buttons = document.querySelectorAll('.cta > .button')

    buttons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', async (event) => {
            event.preventDefault()

            const target = event.target as HTMLElement
            const _cta = target.closest('.cta')

            if (!_cta) {
                return
            }

            const _input = _cta.querySelector('input[type="email"]') as HTMLInputElement

            // Validate email format
            if (!_input || !EMAIL_REGEX.test(_input.value)) {
                // _input.classList.add('error')
                // setTimeout(() => _input.classList.remove('error'), 500)

                error_toast('Invalid email!')
                return
            }

            const email = _input.value
            toggle_controls(_input, button)

            try {
                const response = await send_email(API_URL, email)

                // Handle response based on server status
                switch (response.status) {
                    case 409: // Email already exists
                        show_modal('modal_email_duplicate')
                        break
                    case 200: // Subscription reactivated
                        show_modal('modal_email_reactivated')
                        break
                    case 201: // New subscription
                        show_modal('modal_email_sent')
                        break
                    default: // Unknown error
                        error_toast('Something went wrong. Please try again later.')
                }
            } catch (err) {
                error_toast('Unable to reach the server. Please try again later.')
            } finally {
                _input.value = ''
                toggle_controls(_input, button)
            }
        })
    })
}

// Utility function to disable/enable input and button
function toggle_controls(input: HTMLInputElement, button: HTMLButtonElement): void {
    input.disabled = !input.disabled
    button.disabled = !button.disabled
}
