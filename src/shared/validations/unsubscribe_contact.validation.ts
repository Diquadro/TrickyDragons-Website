import { z } from 'zod'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { utm_params_schema } from '@shared/schemas/utm_params.schema'

export const contact_subscription_enum = z.enum([ContactSubscriptions.newsletter])

export const unsubscribe_contact_request_schema = z.object({
    email: z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase()),
    subscription: contact_subscription_enum,
    utm_params: utm_params_schema.optional(),
    timezone: z.string().optional(),
})

export const contact_unsubscribe_outcome_enum = z.enum([
    'ALREADY_UNSUBSCRIBED',
    'SUCCESSFULLY_UNSUBSCRIBED',
    'CONTACT_NOT_FOUND',
])

export const unsubscribe_contact_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z
        .object({
            contact_id: z.string().optional(),
            outcome: contact_unsubscribe_outcome_enum,
            processed_at: z.string().optional(),
        })
        .optional(),
})

export type Unsubscribe_Contact_Request = z.infer<typeof unsubscribe_contact_request_schema>
export type Unsubscribe_Contact_Response = z.infer<typeof unsubscribe_contact_response_schema>
export type Unsubscribe_Contact_Response_Outcome = z.infer<typeof contact_unsubscribe_outcome_enum>
export const CONTACT_UNSUBSCRIBE_OUTCOME = contact_unsubscribe_outcome_enum.enum

export function validate_response(response: any) {
    const validation = unsubscribe_contact_response_schema.safeParse(response)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}

export function validate_request(body: Request['body']) {
    const validation = unsubscribe_contact_request_schema.safeParse(body)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}
