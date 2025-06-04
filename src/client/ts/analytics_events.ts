import { get_device_fingerprint } from './thumbmarkjs'
import { get_session_id } from './session_manager'
import { get_utm_params } from './utm_params'
import { get_timezone } from './timezone'
import { get_screen_infos } from './screen_infos'
import { debounce_async } from './debounce'
import {
    Analytics_Event_Request,
    analytics_event_request_schema,
} from '@shared/validations/analytics_event.validation'
import AnalyticsEventName from '@shared/schemas/database/public/AnalyticsEventName'
import { API, ENV } from '@shared/constants/app.constants'

/**
 * Create complete analytics event data
 */
async function create_event_data(
    event_name: AnalyticsEventName,
    details?: Record<string, any>,
): Promise<Analytics_Event_Request> {
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
async function send_analytics_event(event_data: Analytics_Event_Request): Promise<void> {
    try {
        // Validate request data with zod safeParse
        const validation_result = analytics_event_request_schema.safeParse(event_data)

        if (!validation_result.success) {
            console.error('Analytics event validation failed:', validation_result.error.issues)
            return
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
        })

        if (!response.ok) {
            console.error(`Analytics request failed with status ${response.status}: ${response.statusText}`)
        }
    } catch (error) {
        console.error('Failed to send analytics event:', {
            event_name: event_data.event_name,
            error: error instanceof Error ? error.message : 'Unknown error',
            session_id: event_data.session_id,
        })
    }
}

/**
 * General purpose analytics event tracker
 * Handles all the data collection and sending logic
 * @param event_name The type of event to track
 */
export async function track_event(
    event_name: AnalyticsEventName,
    details?: Record<string, any>,
): Promise<void> {
    const event_data = await create_event_data(event_name, details)
    send_analytics_event(event_data)
}

/**
 * Track page view event
 */
async function track_page_view(): Promise<void> {
    await track_event(AnalyticsEventName.page_view, { ...get_utm_params() })
}

/**
 * Track page scroll event (one-shot)
 */
async function track_page_scroll(): Promise<void> {
    await track_event(AnalyticsEventName.page_scroll, { ...get_utm_params() })
}

/**
 * Track page leave event (internal, not debounced)
 */
async function track_page_leave_internal(): Promise<void> {
    await track_event(AnalyticsEventName.page_leave, { ...get_utm_params() })
}

/**
 * Debounced page leave function to prevent duplicates
 * 100ms debounce window to handle rapid-fire events
 */
const track_page_leave = debounce_async(track_page_leave_internal, 100)

/**
 * Track custom analytics event (alias for track_event for backward compatibility)
 * @param event_name The type of event to track
 */
export async function track_custom_event(
    event_name: AnalyticsEventName,
    details?: Record<string, any>,
): Promise<void> {
    await track_event(event_name, details)
}

/**
 * Handle page visibility changes - big tech approach (same session, multiple page views)
 */
function handle_visibility_change(): void {
    if (document.hidden) {
        // Page hidden - track leave (includes tab switching)
        track_page_leave()
    } else {
        // Page visible again - track new page view (same session)
        track_page_view()
    }
}

/**
 * Initialize analytics tracking for static websites
 * Uses big tech approach: same session, multiple page views with debounced leave events
 */
export function initialize_analytics(): void {
    // Track initial page view
    track_page_view()

    // Track scroll event (one-shot)
    const scroll_handler = () => {
        track_page_scroll()
        window.removeEventListener('scroll', scroll_handler)
    }
    window.addEventListener('scroll', scroll_handler, { passive: true })

    // Handle visibility changes - track engagement patterns
    document.addEventListener('visibilitychange', handle_visibility_change)

    // Backup for real page exits (when visibilitychange might not fire)
    window.addEventListener('beforeunload', track_page_leave)
    window.addEventListener('pagehide', track_page_leave)
}
