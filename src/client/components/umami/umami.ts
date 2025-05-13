import { ENV } from '@shared/constants/app.constants'

document.addEventListener('DOMContentLoaded', () => {
    load_umami_dev()
    load_umami_prod()
})

function load_umami_prod() {
    if (ENV.PRODUCTION) {
        const script = document.createElement('script')
        script.defer = true
        script.setAttribute('data-website-id', 'ce981445-5777-42e9-bb76-22050279d2d2')
        script.src = 'https://cloud.umami.is/script.js'
        document.head.appendChild(script)
    } else {
        console.error('🟥 Umami not loaded: Not on an authorized domain')
    }
}

function load_umami_dev() {
    if (ENV.DEVELOPMENT || ENV.LOCAL) {
        const script = document.createElement('script')
        script.defer = true
        script.setAttribute('data-website-id', '5819d2e5-b1ca-423b-baf6-101627f0ff4d')
        script.src = 'https://cloud.umami.is/script.js'
        document.head.appendChild(script)
    } else {
        console.error('🟥 Umami not loaded: Not on an authorized domain')
    }
}
