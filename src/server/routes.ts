import express from 'express'
import { Subscribe_Contact_Controller } from '@server/controllers/subscribe_contact.controller'
import { Unsubscribe_Contact_Controller } from '@server/controllers/unsubscribe_contact.controller'
import { Redirect_Controller } from '@server/controllers/redirect.controller'
import { API } from '@shared/constants/app.constants'

// Configures routes for the Express application
// @param app Express application instance
export function apply_routes(app: express.Application): void {
    // Contacts routes
    app.post(API.ENDPOINTS.CONTACTS.SUBSCRIBE, Subscribe_Contact_Controller.http)
    app.post(API.ENDPOINTS.CONTACTS.UNSUBSCRIBE, Unsubscribe_Contact_Controller.http)

    // Redirects routes
    app.get(API.ENDPOINTS.REDIRECTS.REDIRECT, Redirect_Controller.http)

    // Health check route
    app.get(API.ENDPOINTS.HEALTH, (_, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // 404 handler for undefined routes
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `The requested resource ${req.path} was not found`,
            status: 404,
        })
    })
}
