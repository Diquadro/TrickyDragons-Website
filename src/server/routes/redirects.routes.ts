import PromiseRouter from 'express-promise-router'
import { Redirects_Controllers } from '@server_controllers/redirects.controllers'

export const redirects_router = PromiseRouter()

redirects_router.get('/v1/redirects/:data64', Redirects_Controllers.redirect)
