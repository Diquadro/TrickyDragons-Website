import { z } from 'zod'
import { utm_params_schema } from '@shared/schemas/utm_params.schema'
import { Request } from 'express'

export const contacts_add_to_cart_request_schema = z.object({
    email: z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase()),
    timezone: z.string().optional(),
    utm_params: utm_params_schema.optional(),
})

export const contacts_add_to_cart_response_schema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
})

export type Contacts_Add_To_Cart_Request = z.infer<typeof contacts_add_to_cart_request_schema>
export type Contacts_Add_To_Cart_Response = z.infer<typeof contacts_add_to_cart_response_schema>

export function validate_request(body: Request['body']) {
    const validation = contacts_add_to_cart_request_schema.safeParse(body)
    if (!validation.success) {
        throw new Error(validation.error.message)
    }
    return validation.data
}

export function validate_response(response: any) {
    const validation = contacts_add_to_cart_response_schema.safeParse(response)
    if (!validation.success) {
        throw new Error(validation.error.message)
    }
    return validation.data
}
