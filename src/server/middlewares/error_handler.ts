import { Request, Response, NextFunction } from 'express'
import { app_error } from '@shared/utils/errors'
import { HTTP_STATUS } from '@shared/constants/app.constants'

// Middleware for centralized error handling. Catches all errors and formats them into consistent responses
export const error_handler = (err: Error | app_error, _req: Request, res: Response, _next: NextFunction) => {
    // Log the error
    console.error('Error:', err)

    // Default status code and message
    let status_code = HTTP_STATUS.INTERNAL_SERVER_ERROR
    let message = 'Internal Server Error'
    let details = undefined

    // Handle app_error types
    if (err instanceof app_error) {
        status_code = err.status_code
        message = err.message
        details = err.details
    } else {
        // For standard errors, just use the message
        message = err.message
    }

    // In development, include stack trace for non-app_error types
    if (process.env.NODE_ENV !== 'production' && !(err instanceof app_error)) {
        details = err.stack
    }

    // Send the formatted error response
    return res.status(status_code).json({
        error: message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
    })
}
