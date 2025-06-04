import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '@shared/constants/app.constants'

// Middleware for centralized error handling with detailed server logging
export const error_handler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    // ✅ Detailed server logging for debugging
    console.error('='.repeat(80))
    console.error('🚨 ERROR CAUGHT:', new Date().toISOString())
    console.error('📍 Endpoint:', `${req.method} ${req.originalUrl}`)
    console.error('👤 IP:', req.clientIp)
    console.error('📋 Headers:', JSON.stringify(req.headers, null, 2))

    if (req.body && Object.keys(req.body).length > 0) {
        console.error('📦 Body:', JSON.stringify(req.body, null, 2))
    }

    console.error('❌ Error Name:', err.name)
    console.error('💬 Error Message:', err.message)

    if (err.stack) {
        console.error('📚 Stack Trace:')
        console.error(err.stack)
    }

    console.error('='.repeat(80))

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString(),
    })
}
