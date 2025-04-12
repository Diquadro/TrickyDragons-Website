import '@client_components/spinner/spinner.scss'

export function show_spinner(show: boolean): void {
    const spinner_overlay = document.getElementById('spinner-overlay')
    if (!spinner_overlay) return

    if (show) {
        spinner_overlay.classList.remove('hidden')
    } else {
        spinner_overlay.classList.add('hidden')
    }
}
