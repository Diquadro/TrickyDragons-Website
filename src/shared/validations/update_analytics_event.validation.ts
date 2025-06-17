import { z } from 'zod'

export const update_analytics_event_request_schema = z.object({
    event_id: z.string().uuid('Invalid event ID format'),
    occurred_at: z.string().datetime().optional(), // Will use current time if not provided
})

export const update_analytics_event_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            event_id: z.string().optional(),
            updated_at: z.string().optional(),
            occurred_at: z.string().optional(),
        })
        .optional(),
})

export type Update_Analytics_Event_Request = z.infer<typeof update_analytics_event_request_schema>
export type Update_Analytics_Event_Response = z.infer<typeof update_analytics_event_response_schema>

export function validate_request(body: Request['body']): Update_Analytics_Event_Request {
    const validation = update_analytics_event_request_schema.safeParse(body)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}

export function validate_response(response: any): Update_Analytics_Event_Response {
    const validation = update_analytics_event_response_schema.safeParse(response)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}
