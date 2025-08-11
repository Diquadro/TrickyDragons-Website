import cors from 'cors'
import { ENV, CLIENT, API } from '@shared/constants/app.constants'

// CORS middleware configuration
// Enables Cross-Origin Resource Sharing with appropriate settings
export const cors_middleware = cors({
    origin: ENV.PRODUCTION ? [CLIENT.URL, API.URL] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
})
