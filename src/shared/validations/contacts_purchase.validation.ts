import { z } from 'zod'
import { utm_params_schema } from '@shared/schemas/utm_params.schema'

export const contacts_purchase_request_schema = z.object({
    email: z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase()),
    session_id: z.string().min(1, 'Stripe session ID is required'),
    timezone: z.string().optional(),
    utm_params: utm_params_schema.optional(),
})

export const contacts_purchase_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            order_id: z.string().optional(),
            contact_id: z.string().optional(),
            processed_at: z.string().optional(),
        })
        .optional(),
})

export type Contacts_Purchase_Request = z.infer<typeof contacts_purchase_request_schema>
export type Contacts_Purchase_Response = z.infer<typeof contacts_purchase_response_schema>

export function validate_request(body: Request['body']) {
    const validation = contacts_purchase_request_schema.safeParse(body)
    if (!validation.success) {
        throw new Error(validation.error.message)
    }
    return validation.data
}

export function validate_response(response: any) {
    const validation = contacts_purchase_response_schema.safeParse(response)
    if (!validation.success) {
        throw new Error(validation.error.message)
    }
    return validation.data
}
