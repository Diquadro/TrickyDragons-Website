import { utm_param } from '@shared/types/utm_params'

const VERSION = 'v2'

// Environment-related constants
// Use APP_ENV as primary environment variable
const effective_env = process.env.APP_ENV

export const ENV = {
    PRODUCTION: effective_env === 'production',
    DEVELOPMENT: effective_env === 'development',
    TEST: effective_env === 'test',
    LOCAL: effective_env === 'local' || !effective_env,
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
            ADD_TO_CART: `/${VERSION}/contacts/add-to-cart`,
            REMOVE_FROM_CART: `/${VERSION}/contacts/remove-from-cart`,
            PURCHASE: `/${VERSION}/contacts/purchase`,
        },
        ANALYTICS_EVENTS: {
            CREATE: `/${VERSION}/analytics-events/create`,
            UPDATE: `/${VERSION}/analytics-events/update`,
        },
        REDIRECTS: {
            REDIRECT: `/${VERSION}/redirects`,
        },
        WEBHOOKS: {
            SMTP2GO: `/${VERSION}/webhooks/smtp2go`,
            STRIPE: `/${VERSION}/webhooks/stripe`,
        },
        STRIPE: {
            CREATE_CHECKOUT_SESSION: `/${VERSION}/stripe/create-checkout-session`,
            SESSION_STATUS: `/${VERSION}/stripe/session-status`,
        },
        ADMIN: {
            TABLES: `/${VERSION}/admin/tables`,
            COUNTS: `/${VERSION}/admin/counts`,
        },
        EMAILS: {
            SEND_WELCOME_VIP: `/${VERSION}/send-email-welcome-vip`,
            SEND_WELCOME_NON_VIP: `/${VERSION}/send-email-welcome-non-vip`,
        },
    },

    EVENTS: {
        ACTIONS: {
            SUBSCRIBE_CONTACT: `${VERSION}_subscribe_contact`,
            UNSUBSCRIBE_CONTACT: `${VERSION}_unsubscribe_contact`,
            REDIRECT: `${VERSION}_redirect`,
            SEND_WELCOME_EMAIL: `${VERSION}_send_welcome_email`,
            ADD_TO_CART: `${VERSION}_add_to_cart`,
            PURCHASE: `${VERSION}_purchase`,

            // SMTP2GO Email Events
            SMTP2GO_EMAIL_PROCESSED: `${VERSION}_smtp2go_email_processed`,
            SMTP2GO_EMAIL_DELIVERED: `${VERSION}_smtp2go_email_delivered`,
            SMTP2GO_EMAIL_OPENED: `${VERSION}_smtp2go_email_opened`,
            SMTP2GO_EMAIL_CLICKED: `${VERSION}_smtp2go_email_clicked`,
            SMTP2GO_EMAIL_BOUNCED: `${VERSION}_smtp2go_email_bounced`,
            SMTP2GO_EMAIL_SPAM: `${VERSION}_smtp2go_email_spam`,
            SMTP2GO_EMAIL_UNSUBSCRIBED: `${VERSION}_smtp2go_email_unsubscribed`,
            SMTP2GO_EMAIL_REJECTED: `${VERSION}_smtp2go_email_rejected`,

            // Stripe Webhook Events
            STRIPE_WEBHOOK_PAYMENT_INTENT_CREATED: 'stripe_webhook_payment_intent_created',
            STRIPE_WEBHOOK_PAYMENT_SUCCEEDED: 'stripe_webhook_payment_succeeded',
            STRIPE_WEBHOOK_PAYMENT_FAILED: 'stripe_webhook_payment_failed',
            STRIPE_WEBHOOK_PAYMENT_CANCELED: 'stripe_webhook_payment_canceled',
            STRIPE_WEBHOOK_REFUND_CREATED: 'stripe_webhook_refund_created',
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
    PRODUCTS: {
        TRICKY_DRAGONS_RESERVATION: 'Tricky Dragons Reservation',
    },
    API_VERSION: '2025-07-30.basil' as const,
    WEBHOOK_EVENTS: {
        PAYMENT_INTENT_CREATED: 'payment_intent.created',
        PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
        PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
        PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
        REFUND_CREATED: 'refund.created',
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
    LEAD: 'Lead',
    ADD_TO_CART: 'AddToCart',
    PURCHASE: 'Purchase',
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
