import PromiseRouter from 'express-promise-router'
import { Contacts_Controllers } from '@server_controllers/contacts.controllers'

export const contacts_router = PromiseRouter()

contacts_router.post('/v1/contacts/status/lead', Contacts_Controllers.create_lead)
contacts_router.patch('/v1/contacts/subscriptions/newsletter', Contacts_Controllers.subscribe_to_newsletter)
contacts_router.delete(
    '/v1/contacts/subscriptions/newsletter',
    Contacts_Controllers.unsubscribe_to_newsletter,
)
