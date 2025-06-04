import express from 'express'
// import { Unsubscribe_Contact_Controller } from '@server/old_controllers/unsubscribe_contact.controller'
// import { Redirect_Controller } from '@server/old_controllers/redirect.controller'
import { API } from '@shared/constants/app.constants'
import { subscribe_contact } from '@server/controllers/subscribe_contact'
import { unsubscribe_contact } from '@server/controllers/unsubscribe_contact'
import { create_analytics_event_http } from '@server/controllers/create_analytics_event_http'
import { redirect } from '@server/controllers/redirect'
import { error_handler } from '@server/middlewares/error_handler'

// Configures routes for the Express application
// @param app Express application instance
export function apply_routes(app: express.Application): void {
    // Contacts routes
    app.post(API.ENDPOINTS.CONTACTS.SUBSCRIBE, subscribe_contact)
    app.post(API.ENDPOINTS.CONTACTS.UNSUBSCRIBE, unsubscribe_contact)

    // Redirects routes
    app.get(API.ENDPOINTS.REDIRECTS.REDIRECT, redirect)

    // Analytics events routes
    app.post(API.ENDPOINTS.ANALYTICS_EVENTS.CREATE, create_analytics_event_http)

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
