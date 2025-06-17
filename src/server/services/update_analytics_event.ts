import { sql } from '@server/models/postgres_client'
import AnalyticsEvents from '@shared/schemas/database/public/AnalyticsEvents'

/**
 * Update analytics event record in database
 * Updates the occurred_at timestamp to track user engagement duration
 */
export async function update_analytics_event(event_id: string, occurred_at: Date): Promise<AnalyticsEvents> {
    const updated_events = await sql.update<AnalyticsEvents[]>('analytics_events', [
        {
            uuid: event_id,
            occurred_at,
        },
    ])

    if (updated_events.length === 0) {
        throw new Error(`Analytics event with ID ${event_id} not found`)
    }

    return updated_events[0]
}
