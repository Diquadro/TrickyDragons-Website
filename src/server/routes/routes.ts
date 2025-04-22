import express from 'express'
import { contacts_router } from '@server_routes/contacts.routes'
import { emails_router } from '@server_routes/emails.routes'
import { redirects_router } from '@server_routes/redirects.routes'
import { rpc_router } from '@server_routes/rpc.routes'

export function apply_routes(app: express.Application) {
    app.use('', contacts_router)
    app.use('', emails_router)
    app.use('', redirects_router)
    app.use('', rpc_router)
}
