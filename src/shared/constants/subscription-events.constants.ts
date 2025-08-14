/**
 * Constants for subscription events used in redirect logic
 */
export const SUBSCRIPTION_EVENT = {
    NEW_CONTACT: 'new-contact',
    ALREADY_SUBSCRIBED: 'already-subscribed',
    RESUBSCRIBED: 'resubscribed',
} as const

export type SubscriptionEvent = (typeof SUBSCRIPTION_EVENT)[keyof typeof SUBSCRIPTION_EVENT]
