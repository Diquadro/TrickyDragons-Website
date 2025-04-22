import EventDirection from '@schemas/public/EventDirection'
import EventOutcome from '@schemas/public/EventOutcome'
import { EventsMutator } from '@schemas/public/Events'
import { Addresses_Services } from '@server_services/addresses.services'
import { event_batch_input, Events_Services } from '@server_services/events.services'
import { try_catch } from '@server_utils/try_catch'
import { Request } from 'express'

export async function create_events_connection(base_data: EventsMutator, batch_data?: event_batch_input) {
    const [events_ok, events_err] = await try_catch(Events_Services.create_events(base_data, batch_data))

    if (!events_ok) {
        console.error(events_err)
    }
}

export type Events_Required_Base_Data_Fields = Pick<EventsMutator, 'action' | 'direction' | 'outcome'>
export type Events_Base_Data_Fields = Events_Required_Base_Data_Fields & Partial<EventsMutator>

/**
 * Creates base event data with standardized fields
 * @param data Partial EventsMutator object - requires at least action, direction, and outcome
 * @param req Optional Express request object for additional context
 * @returns Standardized EventsMutator object
 */
export function build_events_base_data(
    data: Events_Base_Data_Fields,
    req?: Request,
): Events_Base_Data_Fields {
    return {
        action: data.action,
        direction: data.direction,
        endpoint: data.endpoint ?? (req ? `${req.method} - ${req.originalUrl}` : null),
        origin: data.origin ?? req?.get('Referrer'),
        occurred_at: data.occurred_at ?? new Date(),
        outcome: data.outcome,
        details: data.details,
        address_uuid: data.address_uuid,
        contact_uuid: data.contact_uuid,
    }
}

/**
 * Transforms an array of EventsMutator objects into a batch format
 * where each property becomes an array of values
 * @param data Array of EventsMutator objects to transform
 * @returns An object with arrays of values for each property
 *
 * const data = [
 *    { action: "click", origin: "web", outcome: "success" },
 *    { action: "submit", origin: "app", outcome: "failure" }
 * ];
 *
 * const batchData = build_events_batch_data(data);
 * {
 *    action:  ["click", "submit"],
 *    origin:  ["web", "app"],
 *    outcome: ["success", "failure"]
 * }
 */
export function build_events_batch_data(data: EventsMutator[]): event_batch_input {
    if (!data?.length) return {}

    const result: event_batch_input = {}
    const all_keys = new Set<string>()

    // One pass to collect keys
    for (const item of data) {
        for (const key in item) {
            all_keys.add(key)
        }
    }

    // Initialize arrays
    for (const key of all_keys) {
        const typed_key = key as keyof EventsMutator
        result[typed_key] = []
    }

    // Fill arrays in one pass
    for (const item of data) {
        for (const key of all_keys) {
            const typed_key = key as keyof EventsMutator
            ;(result[typed_key] as any[]).push(item[typed_key])
        }
    }

    return result
}
