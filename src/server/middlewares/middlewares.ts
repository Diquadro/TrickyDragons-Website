import express from 'express'
import { rate_limiter } from './rate_limiter'
import { cors_middleware } from './cors'
import { request_ip } from './request_ip'
import { geo_info_middleware } from './geo_infos'
import { express_json } from './express_json'
import { block_bots } from './block_bots'
import { morgan_middleware } from './morgan'
import { error_handler } from './error_handler'

// Applies all middlewares to the Express application
// Order is important!
//
// @param app Express application instance
export function apply_middlewares(app: express.Application): void {
    // Logging - must be first to log all requests
    app.use(morgan_middleware)

    // Security - early in the middleware chain
    app.use(block_bots)
    app.use(rate_limiter)
    app.use(cors_middleware)

    // Request parsing
    app.use(express_json)

    // Request enrichment
    app.use(request_ip)
    app.use(geo_info_middleware)

    // Error handling - must be last
    app.use(error_handler)
}
