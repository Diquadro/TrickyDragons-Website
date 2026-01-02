import { get_device_fingerprint } from './thumbmarkjs'
import { get_session_id, is_current_session_expired } from './session_manager'
import { get_utm_params } from './utm_params'
import { get_timezone } from './timezone'
import { get_screen_infos } from './screen_infos'
import {
    should_create_new_events,
    get_existing_page_events,
    register_page_events,
    update_page_activity,
    cleanup_expired_sessions,
} from './session_page_tracker'
import {
    Create_Analytics_Event_Request,
    create_analytics_event_request_schema,
} from '@shared/validations/create_analytics_event.validation'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import { API, ENV } from '@shared/constants/app.constants'

// State management for unified session-based analytics
// Only page_leave needs to be tracked for updates
let current_session_page_leave_id: string | null = null
let current_tracked_session_id: string | null = null
let final_update_sent: boolean = false

/**
 * Create complete analytics event data
 */
async function create_event_data(
    event_name: AnalyticsEventName,
    details?: Record<string, any>,
): Promise<Create_Analytics_Event_Request> {
    const visitor_id = await get_device_fingerprint()
    const utm_params = get_utm_params()
    const timezone = get_timezone()
    const screen_infos = get_screen_infos()

    return {
        session_id: get_session_id(),
        visitor_id,
        event_name,
        page_title: document.title,
        page_referrer: document.referrer,
        timezone,
        screen_infos,
        utm_params,
        details: details,
    }
}

/**
 * Send analytics event to backend with validation
 */
async function send_analytics_event(event_data: Create_Analytics_Event_Request): Promise<string | null> {
    try {
        const validation_result = create_analytics_event_request_schema.safeParse(event_data)

        if (!validation_result.success) {
            console.error('Analytics event validation failed:', validation_result.error.issues)
            return null
        }

        const endpoint = ENV.LOCAL
            ? `${API.ENDPOINTS.ANALYTICS_EVENTS.CREATE}`
            : `${API.URL}${API.ENDPOINTS.ANALYTICS_EVENTS.CREATE}`

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(validation_result.data),
            keepalive: true,
        })

        if (!response.ok) {
            console.error(`Analytics request failed with status ${response.status}: ${response.statusText}`)
            return null
        }

        const response_data = await response.json()
        return response_data.data?.event_id || null
    } catch (error) {
        console.error('Failed to send analytics event:', {
            event_name: event_data.event_name,
            error: error instanceof Error ? error.message : 'Unknown error',
            session_id: event_data.session_id,
        })
        return null
    }
}

/**
 * Update existing analytics event timestamp
 */
async function update_analytics_event(event_id: string): Promise<void> {
    try {
        const endpoint = ENV.LOCAL
            ? `${API.ENDPOINTS.ANALYTICS_EVENTS.UPDATE}`
            : `${API.URL}${API.ENDPOINTS.ANALYTICS_EVENTS.UPDATE}`

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ event_id }),
        })

        if (!response.ok) {
            console.error(`Analytics update failed with status ${response.status}: ${response.statusText}`)
        }
    } catch (error) {
        console.error('Failed to update analytics event:', {
            event_id,
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

/**
 * Check if we need to reset analytics session (session expired or changed)
 */
function should_reset_analytics_session(): boolean {
    const current_session_id = get_session_id()

    // Early return pattern for better readability
    if (current_tracked_session_id !== current_session_id) return true
    if (is_current_session_expired()) return true

    return false
}

/**
 * Reset analytics session state
 */
function reset_analytics_session(): void {
    current_session_page_leave_id = null
    current_tracked_session_id = get_session_id()
    final_update_sent = false
}

/**
 * Store event ID if it's a page_leave event (the only one we update)
 */
function store_session_event_id_if_needed(
    event_name: AnalyticsEventName,
    event_id: string,
    session_id: string,
): void {
    if (event_name === AnalyticsEventName.page_leave) {
        current_session_page_leave_id = event_id
        current_tracked_session_id = session_id
    }
    // page_view events are not stored - we don't update them
}

/**
 * General purpose analytics event tracker
 * Automatically stores session IDs for events that need updates (page_leave)
 */
export async function track_event(
    event_name: AnalyticsEventName,
    details?: Record<string, any>,
): Promise<void> {
    const event_data = await create_event_data(event_name, details)
    const event_id = await send_analytics_event(event_data)

    // Automatically store event ID if needed (only for page_leave)
    if (event_id) {
        store_session_event_id_if_needed(event_name, event_id, event_data.session_id)
    }
}

/**
 * Track page view event - creates new record (one per session, not updated)
 */
async function track_page_view(): Promise<void> {
    await track_event(AnalyticsEventName.page_view, { ...get_utm_params() })
}

/**
 * Track page leave event - creates new record (one per session, gets updated)
 */
async function track_page_leave(): Promise<void> {
    await track_event(AnalyticsEventName.page_leave, { ...get_utm_params() })
}

/**
 * Create both page_view and page_leave events atomically and register them
 * This approach is more robust and efficient than sequential creation
 */
async function track_and_register_page_events(): Promise<void> {
    const utm_params = get_utm_params()

    // Create both events simultaneously for better performance and atomicity
    const [page_view_event_data, page_leave_event_data] = await Promise.all([
        create_event_data(AnalyticsEventName.page_view, utm_params),
        create_event_data(AnalyticsEventName.page_leave, utm_params),
    ])

    // Send both events in parallel
    const [page_view_id, page_leave_id] = await Promise.all([
        send_analytics_event(page_view_event_data),
        send_analytics_event(page_leave_event_data),
    ])

    // Register events only if both succeeded (atomic operation)
    if (page_view_id && page_leave_id) {
        register_page_events(page_view_id, page_leave_id)

        // Store page_leave_id for session updates
        store_session_event_id_if_needed(
            AnalyticsEventName.page_leave,
            page_leave_id,
            page_leave_event_data.session_id,
        )
    } else {
        console.warn('Failed to create one or both page events:', {
            page_view_success: !!page_view_id,
            page_leave_success: !!page_leave_id,
        })
    }
}

/**
 * Update existing page_leave event on page refresh
 */
async function update_existing_page_leave_on_refresh(): Promise<void> {
    const existing_events = get_existing_page_events()

    if (existing_events.page_leave_id) {
        // Update the existing page_leave event with current timestamp
        await update_analytics_event(existing_events.page_leave_id)

        // Update local activity tracking
        update_page_activity()

        // Store for session updates
        current_session_page_leave_id = existing_events.page_leave_id
        current_tracked_session_id = get_session_id()
    } else {
        // Fallback: if no existing page_leave found, create new events
        console.warn('No existing page_leave event found during refresh, creating new events')
        track_and_register_page_events()
    }
}

/**
 * Track page scroll event (one-shot)
 */
async function track_page_scroll(): Promise<void> {
    await track_event(AnalyticsEventName.page_scroll, { ...get_utm_params() })
}

/**
 * Track custom analytics event
 */
export async function track_custom_event(
    event_name: AnalyticsEventName,
    details?: Record<string, any>,
): Promise<void> {
    await track_event(event_name, details)
}

/**
 * Handle when user returns to the page (becomes visible)
 */
async function handle_page_return(): Promise<void> {
    // Check if session expired while away
    if (should_reset_analytics_session()) {
        reset_analytics_session()

        // New session = new page_view + new page_leave
        await track_page_view()
        await track_page_leave()
    }
    // If session is still valid, do nothing - page_leave tracks when we LEFT
}

/**
 * Handle when user leaves the page (becomes hidden)
 */
async function handle_page_leave(): Promise<void> {
    // Update existing page_leave with current timestamp
    if (current_session_page_leave_id) {
        await update_analytics_event(current_session_page_leave_id)
        return
    }

    // Fallback: create page_leave if missing (shouldn't happen in normal flow)
    await track_page_leave()
}

/**
 * Handle page visibility changes with correct logic
 * Updates page_leave only when leaving, creates new session when returning after expiry
 */
function handle_visibility_change(): void {
    if (document.hidden) {
        // Page hidden - user is leaving, update page_leave immediately
        handle_page_leave()
    } else {
        // Page visible - user returned, check if session expired
        handle_page_return()
    }
}

/**
 * Send final update using multiple strategies for maximum reliability
 * Uses idempotency check to prevent duplicate sends from multiple unload events
 */
function send_final_update(): void {
    // Prevent duplicate sends from multiple unload events
    if (final_update_sent) return
    if (!current_session_page_leave_id) return
    if (should_reset_analytics_session()) return

    // Mark as sent immediately to prevent race conditions
    final_update_sent = true

    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.ANALYTICS_EVENTS.UPDATE}`
        : `${API.URL}${API.ENDPOINTS.ANALYTICS_EVENTS.UPDATE}`

    const data = JSON.stringify({ event_id: current_session_page_leave_id })

    // Strategy 1: Try sendBeacon first (most reliable for page unload)
    if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(endpoint, data)
        if (success) {
            return
        }
    }

    // Strategy 2: Fallback to fetch with keepalive
    try {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true,
        }).catch(() => {
            // Silent fail - page is unloading anyway
        })
    } catch (error) {
        // Silent fail - nothing more we can do
    }
}

/**
 * Initialize analytics tracking with session-based page tracking
 * Prevents duplicate events on page refresh while correctly tracking navigation
 */
export function initialize_analytics(): void {
    // Initialize session tracking FIRST
    current_tracked_session_id = get_session_id()
    final_update_sent = false

    // THEN cleanup expired sessions (after session is initialized)
    cleanup_expired_sessions()

    // Decide whether to create new events or update existing ones
    if (should_create_new_events()) {
        // Create new page_view and page_leave events atomically
        track_and_register_page_events()
    } else {
        // This is a page refresh - just update the existing page_leave timestamp
        update_existing_page_leave_on_refresh()
    }

    // Track scroll event (one-shot, non-blocking)
    const scroll_handler = () => {
        track_page_scroll().catch()
        window.removeEventListener('scroll', scroll_handler)
    }
    window.addEventListener('scroll', scroll_handler, { passive: true })

    // Handle visibility changes - update page_leave only when leaving
    document.addEventListener('visibilitychange', handle_visibility_change)

    // Use pagehide as primary event (modern, reliable)
    // and beforeunload as fallback for older browsers
    window.addEventListener('pagehide', send_final_update)
    window.addEventListener('beforeunload', send_final_update)
}
