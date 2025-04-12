import rateLimit from 'express-rate-limit'

export const rate_limiter_middleware = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    message: { error: 'Too many requests, try again later.' },
    headers: true,
})
