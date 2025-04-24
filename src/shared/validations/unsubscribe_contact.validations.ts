import { z } from 'zod'
import ContactSubscriptions from '@shared/schemas/public/ContactSubscriptions'

export const contact_unsubscription_enum = z.enum([ContactSubscriptions.newsletter])

export const unsubscribe_contacts_request_schema = z.object({
    email: z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase()),
    subscription: contact_unsubscription_enum,
})

export const unsubscribe_response_outcome_enum = z.enum(['NOT_FOUND', 'ALREADY_UNSUBSCRIBED', 'UNSUBSCRIBED'])

export const unsubscribe_contacts_response_schema = z.object({
    outcome: unsubscribe_response_outcome_enum,
})

export type Unsubscribe_Contacts_Request = z.infer<typeof unsubscribe_contacts_request_schema>
export type Unsubscribe_Contacts_Response = z.infer<typeof unsubscribe_contacts_response_schema>
export type Unsubscribe_Contact_Response_Outcome = z.infer<typeof unsubscribe_response_outcome_enum>
export const UNSUBSCRIBE_RESPONSE_OUTCOME = unsubscribe_response_outcome_enum.enum
