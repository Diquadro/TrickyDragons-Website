document.addEventListener('DOMContentLoaded', () => {
    loadUmamiAnalytics()
})

function loadUmamiAnalytics() {
    const allowedDomains = ['trickydragons.com', 'www.trickydragons.com']

    // Controlla se l'hostname corrisponde ai domini autorizzati
    if (allowedDomains.includes(window.location.hostname)) {
        const script = document.createElement('script')
        script.defer = true
        script.setAttribute('data-website-id', 'ce981445-5777-42e9-bb76-22050279d2d2')
        script.src = 'https://analytics.trickydragons.com/script.js'
        document.head.appendChild(script)
    } else {
        console.error('🟥 Umami not loaded: Not on an authorized domain')
    }
}
