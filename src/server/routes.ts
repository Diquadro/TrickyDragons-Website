import express from 'express'
import { API } from '@shared/constants/app.constants'
import { subscribe_contact } from '@server/controllers/subscribe_contact'
import { unsubscribe_contact } from '@server/controllers/unsubscribe_contact'
import { get_subscriber_count } from '@server/controllers/get_subscriber_count'
import { create_analytics_event_http } from '@server/controllers/create_analytics_event_http'
import { update_analytics_event_http } from '@server/controllers/update_analytics_event_http'
import { redirect } from '@server/controllers/redirect'
import { smtp2go_webhook } from '@server/controllers/smtp2go_webhook'
import { create_checkout_session } from '@server/controllers/create_checkout_session'
import { get_session_status } from '@server/controllers/get_session_status'
import { get_ab_test_variant } from '@server/controllers/get_ab_test_variant'

import { contacts_add_to_cart } from '@server/controllers/contacts_add_to_cart'
import { contacts_purchase } from '@server/controllers/contacts_purchase'
import { stripe_webhook } from '@server/controllers/stripe_webhook'

// Welcome email controllers
import { send_welcome_email_vip_controller } from '@server/controllers/send_welcome_email_vip'
import { send_welcome_email_non_vip_controller } from '@server/controllers/send_welcome_email_non_vip'

// Admin controllers
import { getTableData, getTableCounts } from '@server/controllers/admin'

// Configures routes for the Express application
// @param app Express application instance
export function apply_routes(app: express.Application): void {
    // Contacts routes
    app.post(API.ENDPOINTS.CONTACTS.SUBSCRIBE, subscribe_contact)
    app.post(API.ENDPOINTS.CONTACTS.UNSUBSCRIBE, unsubscribe_contact)
    app.get(API.ENDPOINTS.CONTACTS.SUBSCRIBER_COUNT, get_subscriber_count)

    // Redirects routes
    app.get(API.ENDPOINTS.REDIRECTS.REDIRECT, redirect)

    // Analytics events routes
    app.post(API.ENDPOINTS.ANALYTICS_EVENTS.CREATE, create_analytics_event_http)
    app.post(API.ENDPOINTS.ANALYTICS_EVENTS.UPDATE, update_analytics_event_http)

    // AB Test routes
    app.get(API.ENDPOINTS.AB_TEST.HERO, get_ab_test_variant)

    // Contacts cart routes
    app.post(API.ENDPOINTS.CONTACTS.ADD_TO_CART, contacts_add_to_cart)
    app.post(API.ENDPOINTS.CONTACTS.PURCHASE, contacts_purchase)

    // Welcome email routes
    app.post(API.ENDPOINTS.EMAILS.SEND_WELCOME_VIP, send_welcome_email_vip_controller)
    app.post(API.ENDPOINTS.EMAILS.SEND_WELCOME_NON_VIP, send_welcome_email_non_vip_controller)

    // Webhooks routes
    app.post(API.ENDPOINTS.WEBHOOKS.SMTP2GO, smtp2go_webhook)
    app.post(API.ENDPOINTS.WEBHOOKS.STRIPE, stripe_webhook)

    // Stripe routes
    app.post(API.ENDPOINTS.STRIPE.CREATE_CHECKOUT_SESSION, create_checkout_session)
    app.get(API.ENDPOINTS.STRIPE.SESSION_STATUS, get_session_status)

    // Admin routes
    // app.get(`${API.ENDPOINTS.ADMIN.TABLES}/:tableName`, getTableData)
    // app.get(API.ENDPOINTS.ADMIN.COUNTS, getTableCounts)

    // 404 handler for undefined routes (must be last)
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `The requested resource ${req.path} was not found`,
            status: 404,
        })
    })
}
