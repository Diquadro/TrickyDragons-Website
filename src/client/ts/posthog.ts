import { ENV } from '@shared/constants/app.constants'
import posthog from 'posthog-js'

export function initialize_posthog() {
    if (!ENV.PRODUCTION) return

    // Check if PostHog is already initialized (e.g., by inline script)
    if (posthog.__loaded) {
        return
    }

    posthog.init('phc_gv5ftx8FjCnhDNr3kEcXYPTZtqcSjR91357r6ePqod0', {
        api_host: 'https://eu.i.posthog.com',
        person_profiles: 'always',
        session_recording: {
            maskAllInputs: false,
        },
    })

    if (localStorage.getItem('umami.disabled') === 'true') posthog.opt_out_capturing()
}
