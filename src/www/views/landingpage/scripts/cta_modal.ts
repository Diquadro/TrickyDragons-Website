export function show_modal(id: string): void {
    const modal = document.getElementById(id) as HTMLElement | null
    if (modal) modal.classList.add('show')
}

export default function cta_modal(): void {
    // Seleziona tutti i bottoni con la classe `modal-action`
    const modal_buttons = document.querySelectorAll('.modal-content > .action-button')

    modal_buttons.forEach((button) => {
        button.addEventListener('click', (event: MouseEvent) => close_modal(event))
    })
}

function close_modal(event: MouseEvent): void {
    // Trova il modale più vicino al bottone cliccato
    console.log('HELLO')
    const target = event.target as HTMLElement
    const modal = target.closest('.modal-overlay') as HTMLElement | null

    if (modal) modal.classList.remove('show')
}
