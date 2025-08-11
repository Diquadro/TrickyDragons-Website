import { Request } from 'express'
import morgan from 'morgan'

// Custom token to extract referrer page without query params
morgan.token('referrer-page', (req: Request) => {
    const referrer = req.get('Referrer') || req.get('Referer')
    if (!referrer) return '-'

    try {
        const url = new URL(referrer)
        return url.pathname // Only the path, no query params
    } catch {
        return referrer // Fallback if URL parsing fails
    }
})

// HTTP request logger middleware
export const morgan_middleware = morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] "(from :referrer-page)" ":user-agent"', // Custom format with referrer page
)
