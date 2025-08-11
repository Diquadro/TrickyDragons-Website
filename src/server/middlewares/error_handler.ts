import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '@shared/constants/app.constants'
import { ZodError } from 'zod'

// Helper function to truncate long content
function truncate_content(content: string, max_length: number = 1000): string {
    if (content.length <= max_length) {
        return content
    }
    return content.substring(0, max_length) + `... [TRUNCATED - ${content.length - max_length} more chars]`
}

// Middleware for centralized error handling with detailed server logging
export const error_handler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    // Determine status code based on error type
    let status_code = HTTP_STATUS.INTERNAL_SERVER_ERROR
    let error_type = 'Internal Server Error'

    if (err instanceof ZodError) {
        status_code = HTTP_STATUS.BAD_REQUEST
        error_type = 'Validation Error'
    }

    // ✅ Detailed server logging for debugging (with truncation)
    console.error('='.repeat(80))
    console.error('🚨 ERROR CAUGHT:', new Date().toISOString())
    console.error('📍 Endpoint:', `${req.method} ${req.originalUrl}`)
    console.error('👤 IP:', req.clientIp)

    // Truncate headers if too long
    const headers_json = JSON.stringify(req.headers, null, 2)
    console.error('📋 Headers:', truncate_content(headers_json, 500))

    // Truncate body if too long
    if (req.body && Object.keys(req.body).length > 0) {
        const body_json = JSON.stringify(req.body, null, 2)
        console.error('📦 Body:', truncate_content(body_json, 1000))
    }

    console.error('❌ Error Name:', err.name)
    console.error('💬 Error Message:', err.message)

    // Truncate stack trace if too long
    if (err.stack) {
        console.error('📚 Stack Trace:')
        console.error(err.stack)
    }

    // For ZodError, add clean validation summary
    if (err instanceof ZodError) {
        console.error(
            '🔍 Validation Issues:',
            err.issues.map((issue) => ({
                path: issue.path.join('.'),
                code: issue.code,
                message: issue.message,
            })),
        )
    }

    console.error('='.repeat(80))

    return res.status(status_code).json({
        success: false,
        error: error_type,
        message: status_code === HTTP_STATUS.BAD_REQUEST ? 'Invalid request data' : err.message,
        timestamp: new Date().toISOString(),
    })
}
