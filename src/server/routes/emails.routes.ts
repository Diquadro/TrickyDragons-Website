import PromiseRouter from 'express-promise-router'
import { Emails_Controllers } from '@server_controllers/emails.controllers'

export const emails_router = PromiseRouter()

emails_router.post('/v1/emails/welcome', Emails_Controllers.send_welcome)
