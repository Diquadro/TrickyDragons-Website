import { ENV } from '@shared/constants/app.constants'
import morgan from 'morgan'

// HTTP request logger middleware
// Logs HTTP requests in a developer-friendly format in non-production
// and in a more concise format in production
export const morgan_middleware = morgan(
    !ENV.PRODUCTION
        ? 'dev' // Colorful and detailed in development
        : 'combined', // More compact in production
)
