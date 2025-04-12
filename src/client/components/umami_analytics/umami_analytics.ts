document.addEventListener('DOMContentLoaded', () => {
    loadUmamiAnalytics_dev()
    loadUmamiAnalytics_prod()
})

function loadUmamiAnalytics_prod() {
    const allowedDomains = ['trickydragons.com']

    // Controlla se l'hostname corrisponde ai domini autorizzati
    if (allowedDomains.includes(window.location.hostname)) {
        const script = document.createElement('script')
        script.defer = true
        script.setAttribute('data-website-id', 'ce981445-5777-42e9-bb76-22050279d2d2')
        script.src = 'https://cloud.umami.is/script.js'
        document.head.appendChild(script)
    } else {
        console.error('🟥 Umami not loaded: Not on an authorized domain')
    }
}

function loadUmamiAnalytics_dev() {
    const allowedDomains = ['dev-trickydragons-www.onrender.com']

    // Controlla se l'hostname corrisponde ai domini autorizzati
    if (allowedDomains.includes(window.location.hostname)) {
        const script = document.createElement('script')
        script.defer = true
        script.setAttribute('data-website-id', '5819d2e5-b1ca-423b-baf6-101627f0ff4d')
        script.src = 'https://cloud.umami.is/script.js'
        document.head.appendChild(script)
    } else {
        console.error('🟥 Umami not loaded: Not on an authorized domain')
    }
}
