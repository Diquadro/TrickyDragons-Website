import { z } from 'zod'
import { analyticsEventName } from '@shared/schemas/database/public/AnalyticsEventName'
import { utm_params_schema } from '@shared/schemas/utm_params.schema'
import { screen_infos_schema } from '@shared/schemas/screen_infos.schema'

export const analytics_event_request_schema = z.object({
    session_id: z.string().min(1, 'Session ID is required'),
    visitor_id: z.string().nullable(),
    details: z.record(z.any()).optional(),
    event_name: analyticsEventName,
    page_title: z.string().optional(),
    page_referrer: z.string().optional(),
    timezone: z.string().optional(), // IANA timezone format (e.g., Europe/Rome)
    screen_infos: screen_infos_schema.optional(),
    utm_params: utm_params_schema.optional(),
})

export const analytics_event_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            event_id: z.string().optional(),
            processed_at: z.string().optional(),
        })
        .optional(),
})

export type Analytics_Event_Request = z.infer<typeof analytics_event_request_schema>
export type Analytics_Event_Response = z.infer<typeof analytics_event_response_schema>

export function validate_response(response: any) {
    const validation = analytics_event_response_schema.safeParse(response)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}

export function validate_request(body: Request['body']) {
    const validation = analytics_event_request_schema.safeParse(body)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}
