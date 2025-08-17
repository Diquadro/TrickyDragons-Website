import { API, CLIENT } from '@shared/constants/app.constants'

export const LINKS = {
    EXTERNAL: {
        KICKSTARTER: 'https://www.kickstarter.com/projects/2076650099/tricky-dragons',
        INSTAGRAM: 'https://www.instagram.com/trickydragons',
        FACEBOOK: 'https://www.facebook.com/TrickyDragons/',
        // TODO: Aggiungere il link del gruppo VIP Facebook quando sarà disponibile
        FACEBOOK_VIP_GROUP: 'https://www.facebook.com/groups/TrickyDragonsVIP/', // Placeholder - verificare il link corretto
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
