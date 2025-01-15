import send_email from '../../../../scripts/api/send_email'
import error_toast from '../../../../scripts/error_toast'
import { show_spinner } from '../spinner/spinner'
import { show_modal } from '../cta_modal/cta_modal'

const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function (API_URL: string): void {
    const buttons = document.querySelectorAll('.cta > .button')

    buttons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', handle_button_click(API_URL))
    })
}

function handle_button_click(API_URL: string) {
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
        show_spinner(true)

        try {
            const response = await send_email(API_URL, email)

            handle_response(response.status)
        } catch (err) {
            error_toast('Unable to reach the server. Please try again later.')
        } finally {
            show_spinner(false)
            email_input.value = ''
        }
    }
}

function handle_response(status: number): void {
    switch (status) {
        case 409:
            show_modal('modal_email_duplicate')
            break
        case 200:
            show_modal('modal_email_reactivated')
            break
        case 201:
            show_modal('modal_email_sent')
            break
        default:
            error_toast('Something went wrong. Please try again later.')
    }
}
