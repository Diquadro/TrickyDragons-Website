import express from 'express'
import { rate_limiter_middleware } from '@api_middlewares/rate_limiter.middlewares'
import { cors_middleware } from '@api_middlewares/cors.middlewares'
import { request_ip_middleware } from '@api_middlewares/request_ip.middlewares'
import { geo_infos } from '@api_middlewares/geo_infos.middlewares'
import { json_middleware } from '@api_middlewares/express_json.middlewares'

export function apply_middlewares(app: express.Application) {
    app.use(rate_limiter_middleware)
    app.use(cors_middleware)
    app.use(request_ip_middleware)
    app.use(geo_infos)
    app.use(json_middleware)
}
