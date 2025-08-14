import { z } from 'zod'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { utm_params_schema } from '@shared/schemas/utm_params.schema'

export const contact_subscription_enum = z.enum([ContactSubscriptions.newsletter])

export const subscribe_contact_request_schema = z.object({
    email: z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase()),
    subscription: contact_subscription_enum,
    timezone: z.string().optional(),
    utm_params: utm_params_schema.optional(),
})

export const contact_response_outcome_enum = z.enum(['ALREADY_SUBSCRIBED', 'RESUBSCRIBED', 'NEW_CONTACT'])

export const subscribe_contact_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            contact_id: z.string().optional(),
            processed_at: z.string().optional(),
            outcome: contact_response_outcome_enum,
            has_reserved: z.boolean(),
        })
        .optional(),
})

export type Subscribe_Contact_Request = z.infer<typeof subscribe_contact_request_schema>
export type Subscribe_Contact_Response = z.infer<typeof subscribe_contact_response_schema>
export type Subscribe_Contact_Response_Outcome = z.infer<typeof contact_response_outcome_enum>
export const CONTACT_RESPONSE_OUTCOME = contact_response_outcome_enum.enum

export function validate_response(response: any) {
    const validation = subscribe_contact_response_schema.safeParse(response)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}

export function validate_request(body: Request['body']) {
    const validation = subscribe_contact_request_schema.safeParse(body)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}
