import { utm_params } from '@shared/types/utm_params'
import { ALL_UTM_PARAMETERS } from '@shared/constants/app.constants'

/**
 * UTM Parameters Manager - Client-side UTM parameter handling with localStorage
 * Stores UTM parameters for 24 hours to persist attribution across pages
 */

interface UTM_Storage_Data {
    utm_params: utm_params
    created_at: number
    expires_at: number
}

// UTM storage configuration
const UTM_CONFIG = {
    STORAGE_KEY: 'utm_attribution',
    // UTM attribution window: 24 hours (standard marketing attribution)
    DURATION_MS: 24 * 60 * 60 * 1000,
}

let cached_utm_params: utm_params | null = null

/**
 * Check if UTM data is expired
 */
function is_utm_data_expired(utm_data: UTM_Storage_Data): boolean {
    return Date.now() >= utm_data.expires_at
}

/**
 * Save UTM params to localStorage with expiration
 */
function save_utm_to_storage(utm_params: utm_params): void {
    const now = Date.now()
    const storage_data: UTM_Storage_Data = {
        utm_params,
        created_at: now,
        expires_at: now + UTM_CONFIG.DURATION_MS,
    }

    try {
        localStorage.setItem(UTM_CONFIG.STORAGE_KEY, JSON.stringify(storage_data))
    } catch (error) {
        console.warn('Failed to save UTM params to localStorage:', error)
    }
}

/**
 * Load UTM params from localStorage
 */
function load_utm_from_storage(): utm_params | null {
    try {
        const stored = localStorage.getItem(UTM_CONFIG.STORAGE_KEY)
        if (!stored) return null

        const storage_data = JSON.parse(stored) as UTM_Storage_Data

        // Validate storage data structure
        if (!storage_data.utm_params || !storage_data.created_at || !storage_data.expires_at) {
            return null
        }

        // Check if expired
        if (is_utm_data_expired(storage_data)) {
            // Clean up expired data
            localStorage.removeItem(UTM_CONFIG.STORAGE_KEY)
            return null
        }

        return storage_data.utm_params
    } catch (error) {
        console.warn('Failed to load UTM params from localStorage:', error)
        return null
    }
}

/**
 * Extract UTM parameters from current URL
 */
function extract_utm_from_url(): utm_params {
    const current_url = window.location.href
    const url_obj = new URL(current_url)
    const search_params = url_obj.searchParams

    const utm_params: utm_params = {}

    // Extract only the UTM parameters we support (using same constants as server)
    for (const param of ALL_UTM_PARAMETERS) {
        const value = search_params.get(param)
        if (value) {
            utm_params[param] = value
        }
    }

    return utm_params
}

/**
 * Check if UTM params object has any values
 */
function has_utm_values(utm_params: utm_params): boolean {
    return Object.keys(utm_params).length > 0
}

/**
 * Internal function to detect and cache UTM parameters
 */
function detect_and_cache_utm_params(): utm_params {
    // First, try to get UTM params from current URL
    const url_utm_params = extract_utm_from_url()

    // If we found UTM params in URL, save them and return
    if (has_utm_values(url_utm_params)) {
        save_utm_to_storage(url_utm_params)
        cached_utm_params = url_utm_params
        return url_utm_params
    }

    // No UTM params in URL, try to load from localStorage
    const stored_utm_params = load_utm_from_storage()
    if (stored_utm_params && has_utm_values(stored_utm_params)) {
        cached_utm_params = stored_utm_params
        return stored_utm_params
    }

    // No UTM params found anywhere, return empty object
    cached_utm_params = {}
    return cached_utm_params
}

/**
 * Initialize UTM parameters detection and caching
 * Should be called once when the app starts
 */
export function initialize_utm_params(): void {
    // Only initialize if not already cached
    if (cached_utm_params === null) {
        detect_and_cache_utm_params()
    }
}

/**
 * Get UTM parameters with localStorage persistence
 * Priority: URL params > localStorage > empty object
 */
export function get_utm_params(): utm_params {
    // Initialize if not already done (cached_utm_params will be null)
    if (cached_utm_params === null) {
        return detect_and_cache_utm_params()
    }

    return cached_utm_params
}

/**
 * Clear UTM attribution data (useful for testing)
 */
export function clear_utm_attribution(): void {
    cached_utm_params = null
    try {
        localStorage.removeItem(UTM_CONFIG.STORAGE_KEY)
    } catch (error) {
        console.warn('Failed to clear UTM attribution from localStorage:', error)
    }
}

/**
 * Get UTM attribution info (for debugging)
 */
export function get_utm_attribution_info(): {
    utm_params: utm_params
    expires_in_ms: number
    created_at: number
} | null {
    try {
        const stored = localStorage.getItem(UTM_CONFIG.STORAGE_KEY)
        if (!stored) return null

        const storage_data = JSON.parse(stored) as UTM_Storage_Data

        if (is_utm_data_expired(storage_data)) {
            return null
        }

        return {
            utm_params: storage_data.utm_params,
            expires_in_ms: storage_data.expires_at - Date.now(),
            created_at: storage_data.created_at,
        }
    } catch (error) {
        console.warn('Failed to get UTM attribution info:', error)
        return null
    }
}
