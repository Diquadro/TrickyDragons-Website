import express from 'express'
import { API } from '@shared/constants/app.constants'
import { subscribe_contact } from '@server/controllers/subscribe_contact'
import { unsubscribe_contact } from '@server/controllers/unsubscribe_contact'
import { get_subscriber_count } from '@server/controllers/get_subscriber_count'
import { create_analytics_event_http } from '@server/controllers/create_analytics_event_http'
import { update_analytics_event_http } from '@server/controllers/update_analytics_event_http'
import { redirect } from '@server/controllers/redirect'
import { sendgrid_webhook } from '@server/controllers/sendgrid_webhook'
import { error_handler } from '@server/middlewares/error_handler'

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

    // Webhooks routes
    app.post(API.ENDPOINTS.WEBHOOKS.SENDGRID, sendgrid_webhook)

    // Error handling middleware (must be after all routes)
    app.use(error_handler)

    // 404 handler for undefined routes (must be last)
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `The requested resource ${req.path} was not found`,
            status: 404,
        })
    })
}
