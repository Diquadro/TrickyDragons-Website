import { API, CLIENT } from '@shared/constants/app.constants'

export const LINKS = {
    EXTERNAL: {
        KICKSTARTER: 'https://www.kickstarter.com/projects/2076650099/tricky-dragons',
        INSTAGRAM: 'https://www.instagram.com/trickydragons',
        FACEBOOK_PAGE: 'https://www.facebook.com/TrickyDragons/',
        FACEBOOK_VIP_GROUP: 'https://www.facebook.com/groups/595203270334114/',
    },
    INTERNAL: {
        NEWSLETTER: {
            UNSUBSCRIBE: `${CLIENT.URL}/unsubscribed`,
        },
        RESERVATION: {
            WELCOME: `${CLIENT.URL}/reservation`,
        },
    },
    API: {
        REDIRECT: `${API.URL}${API.ENDPOINTS.REDIRECTS.REDIRECT}`,
    },
}
