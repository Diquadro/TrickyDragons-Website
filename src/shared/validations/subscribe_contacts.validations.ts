import { z } from 'zod'
import ContactSubscriptions from '@schemas/public/ContactSubscriptions'

// Only allow safe subscriptions
export const contact_subscription_enum = z.enum([ContactSubscriptions.newsletter])

export const subscribe_contact_schema = z.object({
    email: z.string().email(),
    subscriptions: z.array(contact_subscription_enum).nonempty(),
})

export const subscribe_contacts_request_schema = z.array(subscribe_contact_schema).nonempty().max(1)

export const contact_response_outcome_enum = z.enum(['ALREADY_SUBSCRIBED', 'RESUBSCRIBED', 'NEW_CONTACT'])

export const subscribe_contacts_response_schema = z.array(
    z.object({
        email: z.string().email(),
        outcome: contact_response_outcome_enum,
    }),
)

export type Subscribe_Contact = z.infer<typeof subscribe_contact_schema>
export type Subscribe_Contacts_Request = z.infer<typeof subscribe_contacts_request_schema>
export type Subscribe_Contacts_Response = z.infer<typeof subscribe_contacts_response_schema>
export const CONTACT_RESPONSE_OUTCOME = contact_response_outcome_enum.enum
