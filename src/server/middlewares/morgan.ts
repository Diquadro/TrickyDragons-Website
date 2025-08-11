import { Request } from 'express'
import morgan from 'morgan'

// Custom token to extract referrer page without query params
morgan.token('referrer-page', (req: Request) => {
    const referrer = req.get('Referer') || req.get('Referrer')

    // EXTENDED DEBUG: Log more info
    console.log('🔍 EXTENDED DEBUG:', {
        'Request URL': req.url,
        'Request Method': req.method,
        'Referer header': req.get('Referer'),
        'Referrer header': req.get('Referrer'),
        'Origin header': req.get('Origin'),
        'Host header': req.get('Host'),
        'X-Forwarded-Host': req.get('X-Forwarded-Host'),
        'X-Forwarded-Proto': req.get('X-Forwarded-Proto'),
        'Referrer-Policy': req.get('Referrer-Policy'),
        'All Headers': Object.keys(req.headers)
            .filter((h) => h.toLowerCase().includes('ref'))
            .reduce((acc, key) => {
                acc[key] = req.headers[key]
                return acc
            }, {} as any),
    })

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
    ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] "(from :referrer-page)" ":user-agent"', // Custom format with referrer page
)
