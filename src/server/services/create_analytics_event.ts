import { sql } from '@server/models/postgres_client'
import AnalyticsEvents from '@shared/schemas/database/public/AnalyticsEvents'
import { screen_infos } from '@shared/types/screen_infos'
import { utm_params } from '@shared/types/utm_params'
import { Create_Analytics_Event_Request } from '@shared/validations/create_analytics_event.validation'
import { Request } from 'express'

interface Analytics_Event {
    event_name: Create_Analytics_Event_Request['event_name']
    session_id?: string | null | undefined
    visitor_id?: string | null | undefined
    details?: {} | null | undefined
    page_title?: string | null | undefined
    page_referrer?: string | null | undefined
    timezone?: string | null | undefined
    screen_infos?: screen_infos | null | undefined
    utm_params?: utm_params | null | undefined
}

/**
 * Create analytics event record in database using middleware-extracted data
 */
export async function create_analytics_event(event_data: Analytics_Event, req: Request) {
    const analytics_event = {
        session_id: event_data.session_id,
        visitor_id: event_data.visitor_id,
        event_name: event_data.event_name,
        page_title: event_data.page_title,
        page_referrer: event_data.page_referrer,

        // Data extracted by middleware
        page_url: req.get('Referer'),
        user_agent: req.get('User-Agent'),

        // UTM parameters (from request body if sent from frontend)
        utm_source: event_data.utm_params?.utm_source,
        utm_medium: event_data.utm_params?.utm_medium,
        utm_campaign: event_data.utm_params?.utm_campaign,
        utm_term: event_data.utm_params?.utm_term,
        utm_content: event_data.utm_params?.utm_content,

        // Browser/device info (extracted by browser_info middleware)
        browser_name: req.browser_info?.name,
        browser_version: req.browser_info?.version,
        os_name: req.browser_info?.os,
        os_version: req.browser_info?.os_version,
        device_type: req.browser_info?.device_type,

        // Location info (extracted by geo_info middleware)
        country: req.geo_infos?.country,
        region: req.geo_infos?.region,
        city: req.geo_infos?.city,
        timezone: event_data.timezone || req.geo_infos?.timezone,
        latitude: req.geo_infos?.latitude,
        longitude: req.geo_infos?.longitude,

        // Screen/viewport info (sent from frontend)
        screen_resolution: event_data.screen_infos?.screen_resolution,
        viewport_size: event_data.screen_infos?.viewport_size,
        language: req.get('Accept-Language')?.split(',')[0],

        details: event_data.details,

        // Server-side timestamp
        occurred_at: new Date(),
    }

    // Remove null/undefined values
    const clean_event = Object.fromEntries(
        Object.entries(analytics_event).filter(([_, value]) => value !== null && value !== undefined),
    )

    const created_events = await sql.insert<AnalyticsEvents[]>('analytics_events', [clean_event])

    if (created_events.length === 0) {
        throw new Error('Failed to create analytics event')
    }

    return created_events[0]
}
