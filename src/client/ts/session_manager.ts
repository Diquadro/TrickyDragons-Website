/**
 * Session Manager - Privacy-friendly session handling with localStorage
 * Follows big tech patterns but without cookies for better privacy
 */

interface Session_Data {
    session_id: string
    created_at: number
    expires_at: number
}

// Session configuration
const SESSION_CONFIG = {
    STORAGE_KEY: 'app_session',
    // Session duration: 10 minutes (optimized for landing pages)
    DURATION_MS: 10 * 60 * 1000,
    // Extend session on activity (like most big platforms)
    EXTEND_ON_ACTIVITY: true,
}

let current_session_data: Session_Data | null = null

/**
 * Generate a secure session ID
 */
function generate_session_id(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 12)
    const crypto_random = crypto
        .getRandomValues(new Uint8Array(8))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

    return `session_${timestamp}_${random}_${crypto_random}`
}

/**
 * Check if current session is expired (exported for analytics and other modules)
 */
export function is_current_session_expired(): boolean {
    if (!current_session_data) return true
    return Date.now() >= current_session_data.expires_at
}

/**
 * Check if a specific session data is expired (internal use)
 */
function is_session_data_expired(session_data: Session_Data): boolean {
    return Date.now() >= session_data.expires_at
}

/**
 * Create new session data
 */
function create_new_session(): Session_Data {
    const now = Date.now()
    return {
        session_id: generate_session_id(),
        created_at: now,
        expires_at: now + SESSION_CONFIG.DURATION_MS,
    }
}

/**
 * Save session to localStorage
 */
function save_session_to_storage(session_data: Session_Data): void {
    try {
        localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session_data))
    } catch (error) {
        console.warn('Failed to save session to localStorage:', error)
    }
}

/**
 * Load session from localStorage
 */
function load_session_from_storage(): Session_Data | null {
    try {
        const stored = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY)
        if (!stored) return null

        const session_data = JSON.parse(stored) as Session_Data

        // Validate session data structure
        if (!session_data.session_id || !session_data.created_at || !session_data.expires_at) {
            return null
        }

        return session_data
    } catch (error) {
        console.warn('Failed to load session from localStorage:', error)
        return null
    }
}

/**
 * Extend current session expiration
 */
function extend_session(session_data: Session_Data): Session_Data {
    const extended_session = {
        ...session_data,
        expires_at: Date.now() + SESSION_CONFIG.DURATION_MS,
    }

    save_session_to_storage(extended_session)
    return extended_session
}

/**
 * Get current session ID, creating or refreshing as needed
 */
export function get_session_id(): string {
    // Return cached session if valid
    if (current_session_data && !is_session_data_expired(current_session_data)) {
        // Extend session on activity if configured
        if (SESSION_CONFIG.EXTEND_ON_ACTIVITY) {
            current_session_data = extend_session(current_session_data)
        }
        return current_session_data.session_id
    }

    // Try to load existing session from storage
    const stored_session = load_session_from_storage()

    if (stored_session && !is_session_data_expired(stored_session)) {
        current_session_data = stored_session

        // Extend session on activity if configured
        if (SESSION_CONFIG.EXTEND_ON_ACTIVITY) {
            current_session_data = extend_session(current_session_data)
        }

        return current_session_data.session_id
    }

    // Create new session
    current_session_data = create_new_session()
    save_session_to_storage(current_session_data)

    return current_session_data.session_id
}

/**
 * Force create a new session (useful for logout, etc.)
 */
export function create_new_session_id(): string {
    current_session_data = create_new_session()
    save_session_to_storage(current_session_data)
    return current_session_data.session_id
}

/**
 * Clear current session
 */
export function clear_session(): void {
    current_session_data = null
    try {
        localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY)
    } catch (error) {
        console.warn('Failed to clear session from localStorage:', error)
    }
}

/**
 * Get session info (for debugging/analytics)
 */
export function get_session_info(): { session_id: string; expires_in_ms: number; created_at: number } | null {
    const session_id = get_session_id() // This will ensure we have a valid session

    if (!current_session_data) return null

    return {
        session_id: current_session_data.session_id,
        expires_in_ms: current_session_data.expires_at - Date.now(),
        created_at: current_session_data.created_at,
    }
}
