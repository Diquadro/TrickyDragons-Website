import { Request, Response, NextFunction } from 'express'
import Bowser from 'bowser'

/**
 * Middleware that extracts browser information from the User-Agent header
 * Uses Bowser library to parse the User-Agent string
 * Adds a browser_info object to the request
 */
export const browser_info_middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Get the User-Agent header
    const user_agent = req.get('User-Agent')

    if (!user_agent) {
        next()
        return
    }

    // Parse the user agent using Bowser
    const parsed_result = Bowser.parse(user_agent)

    // Extract browser information
    const browser = parsed_result.browser
    const os = parsed_result.os
    const platform = parsed_result.platform

    // Create browser_info object with standardized format
    req.browser_info = {
        name: browser?.name || undefined,
        version: browser?.version || undefined,
        os: os?.name || undefined,
        os_version: os?.version || undefined,
        device_type: platform?.type || undefined, // 'desktop', 'mobile', 'tablet'
    }

    next()
}
