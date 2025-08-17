import { isbot } from 'isbot'
import { Request, Response, NextFunction } from 'express'

export function block_bots(req: Request, res: Response, next: NextFunction) {
    // Allow webhooks to bypass bot detection
    // Webhook services like SMTP2GO, AWS SNS may be identified as bots
    if (req.path.startsWith('/v2/webhooks/')) {
        return next()
    }

    const userAgent = req.get('User-Agent') || ''

    if (isbot(userAgent)) {
        return res.status(403).json({ error: 'Access denied for bots' })
    }

    next()
}
