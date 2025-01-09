export function show_modal() {
    const modal = document.getElementById('modal') as HTMLElement
    if (modal) modal.classList.add('show')
}

export default function cta_modal() {
    const actionButton = document.getElementById('modal-action') as HTMLElement

    // Close modal on action button click
    actionButton.addEventListener('click', close_modal)
}

function close_modal() {
    const modal = document.getElementById('modal') as HTMLElement
    if (modal) modal.classList.remove('show')
}
