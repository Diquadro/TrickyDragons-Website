import { ENV } from '@shared/constants/app.constants'

export function initialize_umami() {
    load_umami()
}

function load_umami() {
    const script = document.createElement('script')
    script.defer = true
    if (ENV.PRODUCTION) {
        script.setAttribute('data-website-id', 'ce981445-5777-42e9-bb76-22050279d2d2')
    } else {
        script.setAttribute('data-website-id', '5819d2e5-b1ca-423b-baf6-101627f0ff4d')
    }
    script.src = 'https://cloud.umami.is/script.js'
    document.head.appendChild(script)
}
