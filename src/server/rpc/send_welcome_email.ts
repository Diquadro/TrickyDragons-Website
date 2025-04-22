import Contacts from '@schemas/public/Contacts'
import { try_catch } from '@server_utils/try_catch'
import { build_events_base_data, build_events_batch_data, create_events_connection } from './create_events'
import { EventsMutator } from '@schemas/public/Events'
import EventDirection from '@schemas/public/EventDirection'
import EventOutcome from '@schemas/public/EventOutcome'
import { Emails_Services } from '@server_services/emails.services'
import { CLIENT_URL, API_URL, IS_LOCAL } from '@shared/constants'
import base64url from 'base64url'
import path from 'path'
import { contacts_update_sent_emails } from './contacts_update_sent_emails'

const SERVER_EMAILS_PATH = IS_LOCAL ? path.resolve(__dirname, '../emails') : path.resolve(__dirname, 'emails')
const ACTION = 'v1_send_welcome_email'
const ORIGIN_INTERNAL = 'internal'

export async function send_welcome_email(contacts: Contacts[], event_origin?: string) {
    const [ok, err, data] = await try_catch(send_welcome_email_service(contacts))
    if (!ok) {
        console.error(err)
        return
    }

    create_events(contacts, event_origin)
    contacts_update_sent_emails(contacts, 'welcome_email')
}

function create_events(contacts: Contacts[], event_origin?: string) {
    const base_data = build_events_base_data({
        action: ACTION,
        direction: EventDirection.outbound,
        origin: `${ORIGIN_INTERNAL} - ${event_origin}`,
        outcome: EventOutcome.success,
    })
    const batch_data = build_events_batch_data(
        contacts.map(({ uuid }) => ({
            contact_uuid: uuid,
        })),
    )
    create_events_connection(base_data, batch_data)
}

async function send_welcome_email_service(contacts: Contacts[]) {
    for (const contact of contacts) {
        const from = 'zoho_no_reply'
        const to = contact.email
        const subject = 'Welcome to the world of Tricky Dragons – Your Adventure Awaits'
        const body_template_path = path.join(SERVER_EMAILS_PATH, 'email_subscription/email_subscription.pug')

        const kickstarter_url_data64 = base64url.encode(
            JSON.stringify({
                origin: 'email',
                redirect_url: `https://www.kickstarter.com/projects/2076650099/tricky-dragons`,
            }),
        )

        const instagram_url_data64 = base64url.encode(
            JSON.stringify({
                origin: 'email',
                redirect_url: `https://www.instagram.com/trickydragons`,
            }),
        )

        const email_deactivation_url_data64 = base64url.encode(
            JSON.stringify({
                origin: 'email',
                redirect_url: `${CLIENT_URL}/email_deactivation?data64=${base64url.encode(contact.uuid)}`,
            }),
        )

        const redirect_url = `${API_URL}/v1/redirects/`

        const body_template_locals = {
            kickstarter_url: `${redirect_url}${kickstarter_url_data64}`,
            instagram_url: `${redirect_url}${instagram_url_data64}`,
            email_deactivation: `${redirect_url}${email_deactivation_url_data64}`,
        }

        await Emails_Services.send_email(from, to, subject, body_template_path, body_template_locals)
    }
}
