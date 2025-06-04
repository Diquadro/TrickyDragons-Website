/**
 * Screen Info Manager - Client-side screen and viewport detection
 * Provides screen resolution and viewport size with caching and resize handling
 */

import { screen_infos } from '@shared/types/screen_infos'
import { debounce_async } from './debounce'

let cached_screen_infos: screen_infos | null = null

/**
 * Get current screen resolution
 */
function get_screen_resolution(): string {
    if (typeof window === 'undefined') {
        return 'unknown'
    }

    try {
        const width = window.screen.width
        const height = window.screen.height
        return `${width}x${height}`
    } catch (error) {
        console.warn('Failed to get screen resolution:', error)
        return 'unknown'
    }
}

/**
 * Get current viewport size
 */
function get_viewport_size(): string {
    if (typeof window === 'undefined') {
        return 'unknown'
    }

    try {
        const width = window.innerWidth || document.documentElement.clientWidth
        const height = window.innerHeight || document.documentElement.clientHeight
        return `${width}x${height}`
    } catch (error) {
        console.warn('Failed to get viewport size:', error)
        return 'unknown'
    }
}

/**
 * Detect current screen infos
 */
function detect_screen_infos(): screen_infos {
    return {
        screen_resolution: get_screen_resolution(),
        viewport_size: get_viewport_size(),
    }
}

/**
 * Update screen infos cache (internal, not debounced)
 */
async function update_screen_infos_cache_internal(): Promise<void> {
    cached_screen_infos = detect_screen_infos()
}

/**
 * Debounced screen infos cache update function
 * 100ms debounce window to handle rapid resize events
 */
const update_screen_infos_cache = debounce_async(update_screen_infos_cache_internal, 100)

/**
 * Get screen infos with caching
 * Cache is updated automatically on window resize
 */
export function get_screen_infos(): screen_infos {
    if (cached_screen_infos !== null) {
        return cached_screen_infos
    }

    cached_screen_infos = detect_screen_infos()
    return cached_screen_infos
}

/**
 * Clear screen infos cache (useful for testing)
 */
export function clear_screen_infos_cache(): void {
    cached_screen_infos = null
}

/**
 * Get individual screen resolution
 */
export function get_screen_resolution_only(): string {
    return get_screen_infos().screen_resolution || 'unknown'
}

/**
 * Get individual viewport size
 */
export function get_viewport_size_only(): string {
    return get_screen_infos().viewport_size || 'unknown'
}

/**
 * Initialize screen infos with resize listener
 * Should be called once when the app starts
 */
export function initialize_screen_infos(): void {
    // Initial detection
    get_screen_infos()

    // Update on resize using existing debounce function
    window.addEventListener('resize', () => {
        update_screen_infos_cache()
    })
}
