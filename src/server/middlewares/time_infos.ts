import { Request, Response, NextFunction } from 'express'
import { getTimezoneOffset } from 'date-fns-tz'

/**
 * Time Information Middleware
 * Calculates local timestamps from UTC using timezone information
 * Uses frontend timezone with IP-based fallback strategy
 * Adds a time_infos object to the request
 */

/**
 * Get best available timezone with fallback strategy
 * Priority: frontend_timezone → ip_timezone → null
 */
function get_best_timezone(frontend_timezone?: string | null, ip_timezone?: string | null): string | null {
    // Priority 1: Frontend timezone (most accurate)
    if (frontend_timezone?.trim()) {
        return frontend_timezone.trim()
    }

    // Priority 2: IP-based timezone (good fallback)
    if (ip_timezone?.trim()) {
        return ip_timezone.trim()
    }

    // Priority 3: No timezone available (graceful degradation)
    return null
}

/**
 * Validate if a timezone string is a valid IANA timezone
 */
function is_valid_timezone(timezone: string): boolean {
    try {
        // Use Intl.DateTimeFormat to validate timezone
        Intl.DateTimeFormat(undefined, { timeZone: timezone })
        return true
    } catch {
        return false
    }
}

/**
 * Calculate local timestamp from UTC date and timezone
 * Uses date-fns-tz getTimezoneOffset for accurate offset calculation
 * Then manually calculates the local time by applying the offset
 */
function calculate_local_occurred_at(
    timezone: string | null | undefined,
    utc_date: Date = new Date(),
): Date | null {
    // Early return if no timezone provided
    if (!timezone || !is_valid_timezone(timezone)) {
        return null
    }

    try {
        // Get timezone offset in milliseconds using date-fns-tz
        // This automatically handles DST and all timezone complexities
        const offset_ms = getTimezoneOffset(timezone, utc_date)

        // Calculate local time by adding the offset to UTC time
        // offset_ms is the difference from UTC, so we add it to get local time
        const local_timestamp = new Date(utc_date.getTime() + offset_ms)

        return local_timestamp
    } catch (error) {
        console.warn(`Failed to calculate local timestamp for timezone ${timezone}:`, error)
        return null
    }
}

/**
 * Main middleware function
 * Enriches req.time_infos with timezone and calculated timestamps
 */
export const time_infos_middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Get timezone with fallback strategy
    // Priority: body.timezone → query.timezone → geo_infos.timezone → null
    const frontend_timezone = req.body?.timezone || (req.query?.timezone as string)
    const ip_timezone = req.geo_infos?.timezone

    const best_timezone = get_best_timezone(frontend_timezone, ip_timezone)

    // Calculate local timestamp if we have a timezone
    const utc_occurred_at = new Date()
    const local_occurred_at = best_timezone
        ? calculate_local_occurred_at(best_timezone, utc_occurred_at)
        : null

    // Add to request object for services to use
    req.time_infos = {
        timezone: best_timezone,
        local_occurred_at: local_occurred_at,
        utc_occurred_at: utc_occurred_at,
    }

    next()
}
