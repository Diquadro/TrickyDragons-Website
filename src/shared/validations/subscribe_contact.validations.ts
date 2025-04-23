import { z } from 'zod'
import ContactSubscriptions from '@shared/schemas/public/ContactSubscriptions'

export const contact_subscription_enum = z.enum([ContactSubscriptions.newsletter])

export const subscribe_contacts_request_schema = z.object({
    email: z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase()),
    subscription: contact_subscription_enum,
})

export const contact_response_outcome_enum = z.enum(['ALREADY_SUBSCRIBED', 'RESUBSCRIBED', 'NEW_CONTACT'])

export const subscribe_contacts_response_schema = z.object({
    outcome: contact_response_outcome_enum,
})

export type Subscribe_Contacts_Request = z.infer<typeof subscribe_contacts_request_schema>
export type Subscribe_Contacts_Response = z.infer<typeof subscribe_contacts_response_schema>
export type Subscribe_Contact_Response_Outcome = z.infer<typeof contact_response_outcome_enum>
export const CONTACT_RESPONSE_OUTCOME = contact_response_outcome_enum.enum
