import cors from 'cors'

export const cors_middleware = cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
})
