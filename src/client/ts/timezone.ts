/**
 * Timezone Manager - Client-side timezone detection
 * Detects user's timezone using browser APIs with caching
 */

let cached_timezone: string | null = null

/**
 * Detect user's timezone using Intl API
 */
function detect_timezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
        console.warn('Failed to detect timezone:', error)
        return 'UTC'
    }
}

/**
 * Get user's timezone with caching
 * @returns IANA timezone format (e.g., Europe/Rome, America/New_York)
 */
export function get_timezone(): string {
    if (cached_timezone !== null) {
        return cached_timezone
    }

    cached_timezone = detect_timezone()
    return cached_timezone
}

/**
 * Clear timezone cache (useful for testing)
 */
export function clear_timezone_cache(): void {
    cached_timezone = null
}

/**
 * Get timezone info for debugging
 */
export function get_timezone_info(): {
    timezone: string
    offset_minutes: number
    offset_string: string
} {
    const timezone = get_timezone()
    const now = new Date()
    const offset_minutes = now.getTimezoneOffset()
    const offset_hours = Math.abs(offset_minutes) / 60
    const offset_sign = offset_minutes <= 0 ? '+' : '-'
    const offset_string = `${offset_sign}${offset_hours.toString().padStart(2, '0')}:${(Math.abs(offset_minutes) % 60).toString().padStart(2, '0')}`

    return {
        timezone,
        offset_minutes,
        offset_string,
    }
}
