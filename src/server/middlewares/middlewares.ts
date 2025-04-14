import express from 'express'
import { rate_limiter_middleware } from '@server_middlewares/rate_limiter.middlewares'
import { cors_middleware } from '@server_middlewares/cors.middlewares'
import { request_ip_middleware } from '@server_middlewares/request_ip.middlewares'
import { geo_infos } from '@server_middlewares/geo_infos.middlewares'
import { json_middleware } from '@server_middlewares/express_json.middlewares'
import { block_bots } from '@server_middlewares/block_bots.middlewares'
import { morgan_middleware } from '@server_middlewares/morgan.middlewares'

export function apply_middlewares(app: express.Application) {
    app.use(morgan_middleware)
    app.use(block_bots)
    app.use(rate_limiter_middleware)
    app.use(cors_middleware)
    app.use(json_middleware)
    app.use(request_ip_middleware)
    app.use(geo_infos)
}
