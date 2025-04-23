// Environment-related constants
export const ENV = {
    PRODUCTION: process.env.NODE_ENV === 'production',
    DEVELOPMENT: process.env.NODE_ENV === 'development',
    TEST: process.env.NODE_ENV === 'test',
    LOCAL: process.env.NODE_ENV === 'local' || !process.env.NODE_ENV,
}

// Client-related constants
export const CLIENT = {
    URL: process.env.CLIENT_URL || 'http://localhost:3000',
}

// API-related constants
export const API = {
    URL: process.env.API_URL || 'http://localhost:5000',
    PORT: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,
    HOST: process.env.SERVER_HOST || '0.0.0.0',

    ENDPOINTS: {
        CONTACTS: {
            SUBSCRIBE: '/v1/contacts/subscribe',
            UNSUBSCRIBE: '/v1/contacts/unsubscribe',
        },
        REDIRECTS: {
            REDIRECT: '/v1/redirects/:data64',
        },
        HEALTH: '/v1/health',
    },

    EVENTS: {
        ACTIONS: {
            SUBSCRIBE_CONTACTS: 'v1_subscribe_contacts',
            UNSUBSCRIBE_CONTACTS: 'v1_unsubscribe_contacts',
            REDIRECT: 'v1_redirect',
            SEND_WELCOME_EMAIL: 'v1_send_welcome_email',
        },

        ORIGINS: {
            get SUBSCRIBE_CONTACTS() {
                return `${API.EVENTS.ORIGINS.INTERNAL} - ${API.EVENTS.ACTIONS.SUBSCRIBE_CONTACTS}`
            },
            get UNSUBSCRIBE_CONTACTS() {
                return `${API.EVENTS.ORIGINS.INTERNAL} - ${API.EVENTS.ACTIONS.UNSUBSCRIBE_CONTACTS}`
            },
            get REDIRECT() {
                return `${API.EVENTS.ORIGINS.INTERNAL} - ${API.EVENTS.ACTIONS.REDIRECT}`
            },
            get SEND_WELCOME_EMAIL() {
                return `${API.EVENTS.ORIGINS.INTERNAL} - ${API.EVENTS.ACTIONS.SEND_WELCOME_EMAIL}`
            },
            EXTERNAL: 'EXTERNAL',
            INTERNAL: 'INTERNAL',
            get EXTERNAL_WELCOME_EMAIL() {
                return `${API.EVENTS.ORIGINS.EXTERNAL} - ${API.EVENTS.ACTIONS.SEND_WELCOME_EMAIL}`
            },
        },
    },
}

// Database-related constants
export const DATABASE = {
    MAX_RECORDS_LIMIT: 500,
}

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}
