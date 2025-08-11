import cors from 'cors'
import { ENV, CLIENT, API } from '@shared/constants/app.constants'

// Debug CORS configuration
const allowedOrigins = ENV.PRODUCTION ? [CLIENT.URL, API.URL] : '*'
console.log('🌐 CORS Configuration:', {
    APP_ENV: process.env.APP_ENV,
    ENV_LOCAL: ENV.LOCAL,
    ENV_DEVELOPMENT: ENV.DEVELOPMENT,
    ENV_PRODUCTION: ENV.PRODUCTION,
    CLIENT_URL: CLIENT.URL,
    API_URL: API.URL,
    allowedOrigins,
})

// CORS middleware configuration
// Enables Cross-Origin Resource Sharing with appropriate settings
export const cors_middleware = cors({
    origin: ENV.PRODUCTION ? [CLIENT.URL, API.URL] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
})
