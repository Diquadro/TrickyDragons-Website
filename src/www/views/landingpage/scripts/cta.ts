import send_email from '../../../scripts/api/send_email'
import error_toast from '../../../scripts/error_toast'
import { show_modal } from './cta_modal'

export default function (API_URL: string): void {
    const buttons = document.querySelectorAll('.cta > .button')

    buttons.forEach((button: HTMLButtonElement) => {
        button.addEventListener('click', (event) => {
            event.preventDefault()

            const target = event.target as HTMLElement
            const _cta = target.closest('.cta')

            if (!_cta) {
                return
            }

            const _input = _cta.querySelector('input[type="email"]') as HTMLInputElement

            if (!_input || !_input.checkValidity()) {
                // _input.classList.add('error')
                // setTimeout(() => _input.classList.remove('error'), 500)

                error_toast('Invalid email!')
                return
            }

            const email = _input.value
            _input.value = ''

            send_email(API_URL, email)

            show_modal()
        })
    })
}
