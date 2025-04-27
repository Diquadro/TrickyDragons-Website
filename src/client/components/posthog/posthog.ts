import { ENV } from '@shared/constants/app.constants'
import posthog from 'posthog-js'

document.addEventListener('DOMContentLoaded', () => {
    load_posthog_prod()
})

function load_posthog_prod() {
    if (ENV.PRODUCTION) {
        posthog.init('phc_gv5ftx8FjCnhDNr3kEcXYPTZtqcSjR91357r6ePqod0', {
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
