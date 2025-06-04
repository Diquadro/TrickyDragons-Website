import { z } from 'zod'
import { utm_params_schema } from '@shared/schemas/utm_params.schema'

/**
 * Redirect payload validation schema
 * Used to validate Base64-encoded redirect data
 */
export const redirect_payload_schema = z.object({
    redirect_url: z.string().url('Invalid redirect URL format'),
    email: z.string().email('Invalid email format').optional(),
    utm_params: utm_params_schema.optional(),
    keep_data64: z.boolean().optional(),
})

/**
 * Redirect response validation schema
 * Standard API response format
 */
export const redirect_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            redirect_url: z.string().optional(),
            processed_at: z.string().optional(),
        })
        .optional(),
})

export type Redirect_Payload = z.infer<typeof redirect_payload_schema>
export type Redirect_Response = z.infer<typeof redirect_response_schema>

export function validate_payload(payload: any): Redirect_Payload {
    const validation = redirect_payload_schema.safeParse(payload)

    if (!validation.success) {
        throw new Error(`Invalid redirect payload: ${validation.error.message}`)
    }

    return validation.data
}

export function validate_response(response: any): Redirect_Response {
    const validation = redirect_response_schema.safeParse(response)

    if (!validation.success) {
        throw new Error(`Invalid redirect response: ${validation.error.message}`)
    }

    return validation.data
}
