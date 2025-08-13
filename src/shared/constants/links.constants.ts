import { API, CLIENT } from '@shared/constants/app.constants'

export const LINKS = {
    EXTERNAL: {
        KICKSTARTER: 'https://www.kickstarter.com/projects/2076650099/tricky-dragons',
        INSTAGRAM: 'https://www.instagram.com/trickydragons',
    },
    INTERNAL: {
        NEWSLETTER: {
            UNSUBSCRIBE: `${CLIENT.URL}/unsubscribed`,
        },
    },
    API: {
        REDIRECT: `${API.URL}${API.ENDPOINTS.REDIRECTS.REDIRECT}`,
    },
}
