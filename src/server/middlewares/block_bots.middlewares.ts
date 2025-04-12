// middleware/blockBots.ts

import { isbot } from 'isbot'
import { Request, Response, NextFunction } from 'express'

export function block_bots(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent') || ''

    if (isbot(userAgent)) {
        return res.status(403).json({ error: 'Access denied for bots' })
    }

    next()
}
