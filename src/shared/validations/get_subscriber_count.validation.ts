import { z } from 'zod'

// Request schema (empty for GET request)
export const get_subscriber_count_request_schema = z.object({})

// Response schema
export const get_subscriber_count_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
        count: z.number().int().min(0),
        retrieved_at: z.string(),
    }),
})

export type Get_Subscriber_Count_Request = z.infer<typeof get_subscriber_count_request_schema>
export type Get_Subscriber_Count_Response = z.infer<typeof get_subscriber_count_response_schema>

export function validate_request(data: unknown): Get_Subscriber_Count_Request {
    const validation = get_subscriber_count_request_schema.safeParse(data)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}

export function validate_response(data: unknown): Get_Subscriber_Count_Response {
    const validation = get_subscriber_count_response_schema.safeParse(data)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}
