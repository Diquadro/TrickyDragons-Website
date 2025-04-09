import '@www_components/cta_modal/cta_modal.scss'

export function show_modal(id: string): void {
    const modal = document.getElementById(id) as HTMLElement | null
    if (modal) modal.classList.add('show')
}

document.addEventListener('DOMContentLoaded', () => {
    const modal_buttons = document.querySelectorAll('.cta-modal-content > .action-button')

    modal_buttons.forEach((button) => {
        button.addEventListener('click', (event: MouseEvent) => close_modal(event))
    })
})

function close_modal(event: MouseEvent): void {
    // Trova il modale più vicino al bottone cliccato
    const target = event.target as HTMLElement
    const modal = target.closest('.cta-modal-overlay') as HTMLElement | null

    if (modal) modal.classList.remove('show')
}
