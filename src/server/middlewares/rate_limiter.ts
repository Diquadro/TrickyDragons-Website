import rateLimit from 'express-rate-limit'

// Rate limiter middleware - Limits the number of requests a client can make in a specific time window. Helps prevent abuse and DoS attacks.
export const rate_limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 25, // limit each IP to 25 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests, please try again later',
        statusCode: 429,
    },
})
