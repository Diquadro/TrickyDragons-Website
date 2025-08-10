import { utm_param } from '@shared/types/utm_params'

const VERSION = 'v2'

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
    URL: process.env.API_URL ? `${process.env.API_URL}` : 'http://localhost:5000',
    PORT: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,

    ENDPOINTS: {
        CONTACTS: {
            SUBSCRIBE: `/${VERSION}/contacts/subscribe`,
            UNSUBSCRIBE: `/${VERSION}/contacts/unsubscribe`,
            SUBSCRIBER_COUNT: `/${VERSION}/contacts/subscriber_count`,
        },
        ANALYTICS_EVENTS: {
            CREATE: `/${VERSION}/analytics-events/create`,
            UPDATE: `/${VERSION}/analytics-events/update`,
        },
        REDIRECTS: {
            REDIRECT: `/${VERSION}/redirects`,
        },
        WEBHOOKS: {
            SENDGRID: `/${VERSION}/webhooks/sendgrid`,
        },
        STRIPE: {
            CREATE_CHECKOUT_SESSION: `/${VERSION}/stripe/create-checkout-session`,
            SESSION_STATUS: `/${VERSION}/stripe/session-status`,
        },
    },

    EVENTS: {
        ACTIONS: {
            SUBSCRIBE_CONTACT: `${VERSION}_subscribe_contact`,
            UNSUBSCRIBE_CONTACT: `${VERSION}_unsubscribe_contact`,
            REDIRECT: `${VERSION}_redirect`,
            SEND_WELCOME_EMAIL: `${VERSION}_send_welcome_email`,
        },

        ORIGINS: {
            get SUBSCRIBE_CONTACT() {
                return `${API.EVENTS.ORIGINS.INTERNAL} - ${API.EVENTS.ACTIONS.SUBSCRIBE_CONTACT}`
            },
            get UNSUBSCRIBE_CONTACT() {
                return `${API.EVENTS.ORIGINS.INTERNAL} - ${API.EVENTS.ACTIONS.UNSUBSCRIBE_CONTACT}`
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

export const STRIPE = {
    PRODUCT_MAP: {
        TD_RESERVATION: 'price_1RqonfA5ocAGWp3UYefbC6LT',
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
    REDIRECT: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

export const META_EVENTS = {
    PAGE_VIEW: 'PageView',
    COMPLETE_REGISTRATION: 'CompleteRegistration',
}

export const META = {
    TEST_EVENT_CODE: ENV.PRODUCTION ? 'TEST13799' : 'TEST85018',
}

// Standard UTM parameters (official Google UTM parameters)
export const STANDARD_UTM_PARAMETERS: utm_param[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
]

// Custom UTM parameters (for specific tracking needs like Meta ads)
export const CUSTOM_UTM_PARAMETERS: utm_param[] = [
    'utm_custom_campaign_id',
    'utm_custom_adset_id',
    'utm_custom_ad_id',
    'utm_custom_campaign_name',
    'utm_custom_adset_name',
    'utm_custom_ad_name',
    'utm_custom_placement',
    'utm_custom_site_source_name',
]

// All UTM parameters combined (standard + custom)
export const ALL_UTM_PARAMETERS: utm_param[] = [...STANDARD_UTM_PARAMETERS, ...CUSTOM_UTM_PARAMETERS]
