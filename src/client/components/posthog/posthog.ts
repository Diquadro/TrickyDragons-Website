import { ENV } from '@shared/constants/app.constants'
import posthog from 'posthog-js'

document.addEventListener('DOMContentLoaded', () => {
    load_posthog_dev()
    load_posthog_prod()
})

function load_posthog_prod() {
    if (ENV.PRODUCTION) {
    } else {
        console.error('🟥 Posthog not loaded: Not on an authorized domain')
    }
}

function load_posthog_dev() {
    if (ENV.DEVELOPMENT) {
        posthog.init('phc_PSxWVH6wEiaYVhtH6uTru9gKTbzbKXMXiHPRFJ6CGsC', {
            api_host: 'https://eu.i.posthog.com',
            person_profiles: 'always',
        })

        if (localStorage.getItem('umami.disabled') === 'true') {
            posthog.opt_out_capturing()
        }
    } else {
        console.error('🟥 Posthog not loaded: Not on an authorized domain')
    }
}
