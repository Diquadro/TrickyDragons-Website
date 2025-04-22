import express from 'express'
import { subscribe_contacts_connection } from '../rpc/subscribe_contacts'

export const rpc_router = express.Router()

rpc_router.post('/rpc/v1/subscribe_contacts', subscribe_contacts_connection)
