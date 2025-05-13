import Contacts, { ContactsUuid } from '@shared/schemas/public/Contacts'
import { Emails_Service } from '@server/services/emails.service'
import path from 'path'
import { Base64_Url } from '@shared/utils/base64_url'
import { LINKS } from '@shared/constants/links.constants'
import { Events_Service } from '@server/services/events.service'
import { API, ENV } from '@shared/constants/app.constants'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'
import Addresses, { AddressesUuid } from '@shared/schemas/public/Addresses'
import EventDirection from '@shared/schemas/public/EventDirection'
import EventOutcome from '@shared/schemas/public/EventOutcome'
import { EventsInitializer } from '@shared/schemas/public/Events'
import { try_catch } from '@shared/utils/try_catch'
import { Contacts_Service } from '@server/services/contacts.service'
import { redirect_payload_schema } from '@shared/validations/redirect.validation'

export abstract class Welcome_Email {
    static async send_log_update(origin: string, contact: Contacts, address?: Addresses) {
        const [email_ok, email_error, email] = await try_catch(Welcome_Email.send(contact))

        if (!email_ok) {
            console.error(email_error)
            Welcome_Email.create_failure_event(origin, email_error, contact.uuid, address?.uuid)
        } else {
            Welcome_Email.create_success_event(origin, contact.uuid, address?.uuid)
            Welcome_Email.update_contact(contact)
        }

        return email
    }

    static async send(contact: Contacts) {
        const from = 'zoho_no_reply'
        const to = contact.email
        const subject = 'Welcome to the world of Tricky Dragons – Your Adventure Awaits'
        const body_template_path = ENV.LOCAL
            ? path.resolve(__dirname, 'welcome.pug')
            : path.resolve(__dirname, '..', 'shared/templates/emails/welcome', 'welcome.pug')

        // Create redirect payloads for various links
        const kickstarter_payload = redirect_payload_schema.parse({
            redirect_url: LINKS.EXTERNAL.KICKSTARTER,
            origin: API.EVENTS.ORIGINS.EXTERNAL_WELCOME_EMAIL,
            email: contact.email,
        })

        const instagram_payload = redirect_payload_schema.parse({
            redirect_url: LINKS.EXTERNAL.INSTAGRAM,
            origin: API.EVENTS.ORIGINS.EXTERNAL_WELCOME_EMAIL,
            email: contact.email,
        })

        const unsubscribe_payload = redirect_payload_schema.parse({
            redirect_url: LINKS.INTERNAL.NEWSLETTER.UNSUBSCRIBE,
            origin: API.EVENTS.ORIGINS.EXTERNAL_WELCOME_EMAIL,
            email: contact.email,
        })

        // Encode payloads to Base64 using the encode_json method
        const kickstarter_url_data64 = Base64_Url.encode_json(kickstarter_payload)
        const instagram_url_data64 = Base64_Url.encode_json(instagram_payload)
        const email_deactivation_url_data64 = Base64_Url.encode_json(unsubscribe_payload)

        const redirect_endpoint = API.ENDPOINTS.REDIRECTS.REDIRECT.replace(':data64', '')

        const body_template_locals = {
            kickstarter_url: `${API.URL}${redirect_endpoint}${kickstarter_url_data64}`,
            instagram_url: `${API.URL}${redirect_endpoint}${instagram_url_data64}`,
            email_deactivation: `${API.URL}${redirect_endpoint}${email_deactivation_url_data64}`,
        }

        return await Emails_Service.send(from, to, subject, body_template_path, body_template_locals)
    }

    static async create_success_event(
        origin: string,
        contact_uuid: ContactsUuid,
        address_uuid?: AddressesUuid,
    ) {
        const success_email_event: EventsInitializer = {
            action: API.EVENTS.ACTIONS.SEND_WELCOME_EMAIL,
            direction: EventDirection.outbound,
            origin: origin,
            occurred_at: new Date(),
            outcome: EventOutcome.success,
            details: { email_template: EMAIL_TEMPLATES.WELCOME },
            address_uuid: address_uuid,
            contact_uuid: contact_uuid,
        }

        return await Events_Service.create(success_email_event)
    }

    static async create_failure_event(
        origin: string,
        error: Error,
        contact_uuid: ContactsUuid,
        address_uuid?: AddressesUuid,
    ) {
        const failure_email_event: EventsInitializer = {
            action: API.EVENTS.ACTIONS.SEND_WELCOME_EMAIL,
            direction: EventDirection.outbound,
            origin: origin,
            occurred_at: new Date(),
            outcome: EventOutcome.failure,
            details: {
                email_template: EMAIL_TEMPLATES.WELCOME,
                message: error.message,
                stack: error.stack,
            },
            address_uuid: address_uuid,
            contact_uuid: contact_uuid,
        }

        return await Events_Service.create(failure_email_event)
    }

    static async update_contact(contact: Contacts) {
        const update_contact = {
            uuid: contact.uuid,
            sent_emails: [EMAIL_TEMPLATES.WELCOME, ...(contact.sent_emails ?? [])],
        }
        return await Contacts_Service.update(update_contact)
    }
}
