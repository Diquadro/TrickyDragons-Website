import Contacts from '@schemas/public/Contacts'
import ContactStatus from '@schemas/public/ContactStatus'
import ContactSubscriptions from '@schemas/public/ContactSubscriptions'
import { sql } from '@server_models/models'
import {
    subscribe_contacts_request_schema,
    Subscribe_Contacts_Request,
    Subscribe_Contacts_Response,
    Subscribe_Contact,
    CONTACT_RESPONSE_OUTCOME,
} from '@shared/validations/subscribe_contacts.validations'
import { Request, Response } from 'express'
import { Contacts_Models } from '@server_models/contacts.models'
import { try_catch } from '@server_utils/try_catch'
import EventDirection from '@schemas/public/EventDirection'
import EventOutcome from '@schemas/public/EventOutcome'
import { build_events_base_data, build_events_batch_data, create_events_connection } from './create_events'
import { send_welcome_email } from './send_welcome_email'
import { EventsMutator } from '@schemas/public/Events'
import { get_or_create_addresses, get_or_create_addresses_connection } from './get_or_create_addresses'
import { Emails_Services } from '@server_services/emails.services'
import { Events_Services } from '@server_services/events.services'

const ACTION = 'v1_subscribe_contacts'

export async function subscribe_contacts_connection(req: Request, res: Response) {
    const validation = subscribe_contacts_request_schema.safeParse(req.body)

    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid request', details: validation.error })
    }

    const [contacts_ok, contacts_err, contacts] = await try_catch(subscribe_contacts_service(validation.data))

    if (!contacts_ok) {
        console.error(contacts_err)
        res.status(500).json({ error: 'Internal Server Error' }).send()

        create_failure_event(req, contacts_err)
        return
    }

    const response = build_response(contacts)
    res.status(200).json(response).send()

    create_success_events(contacts, req)
    if (contacts.created.length > 0) send_welcome_email(contacts.created, ACTION)
}

async function create_failure_event(req: Request, err: any) {
    const geo_infos = req.geo_infos ? await get_or_create_addresses_connection([req.geo_infos]) : []
    const geo_record = geo_infos.find(
        (info) =>
            info.city === req.geo_infos?.city &&
            info.state === req.geo_infos?.region &&
            info.country === req.geo_infos?.country,
    )

    const base_data = build_events_base_data(
        {
            action: ACTION,
            direction: EventDirection.inbound,
            outcome: EventOutcome.failure,
            address_uuid: geo_record?.uuid,
            details: Events_Services.write_error_details(err),
        },
        req,
    )

    create_events_connection(base_data)
}

async function create_success_events(
    contacts: {
        already_subscribed: Contacts[]
        updated: Contacts[]
        created: Contacts[]
    },
    req: Request,
) {
    const geo_infos = req.geo_infos ? await get_or_create_addresses_connection([req.geo_infos]) : []

    const geo_record = geo_infos.find(
        (info) =>
            info.city === req.geo_infos?.city &&
            info.state === req.geo_infos?.region &&
            info.country === req.geo_infos?.country,
    )

    const base_data = build_events_base_data(
        {
            action: ACTION,
            direction: EventDirection.inbound,
            outcome: EventOutcome.success,
            address_uuid: geo_record?.uuid,
        },
        req,
    )

    const prep_batch_data = build_for_events_batch_data(contacts)
    const batch_data = build_events_batch_data(prep_batch_data)
    create_events_connection(base_data, batch_data)
}

async function subscribe_contacts_service(input_contacts: Subscribe_Contacts_Request) {
    const input_contacts_normalized: Subscribe_Contact[] = input_contacts.map((c) => ({
        email: c.email.toLowerCase(),
        subscriptions: c.subscriptions,
    }))
    const input_contacts_emails = input_contacts_normalized.map((c) => c.email)
    const input_contacts_map = new Map<string, ContactSubscriptions[]>(
        input_contacts_normalized.map((c) => [c.email, c.subscriptions]),
    )

    const existing_contacts = await Contacts_Models.get_by_emails(input_contacts_emails)

    const already_subscribed_contacts = get_already_subscribed_contacts(input_contacts_map, existing_contacts)

    const contacts_to_resubscribe = get_contacts_to_resubscribe(
        existing_contacts,
        already_subscribed_contacts,
    )
    const updated_contacts = await update_contacts(input_contacts_map, contacts_to_resubscribe)

    const contacts_to_create = get_contracts_to_create(input_contacts_normalized, existing_contacts)
    const created_contacts = await create_contacts(input_contacts_map, contacts_to_create)

    return {
        already_subscribed: already_subscribed_contacts,
        updated: updated_contacts,
        created: created_contacts,
    }
}

function get_already_subscribed_contacts(
    input_contacts_map: Map<string, ContactSubscriptions[]>,
    existing_contacts: Contacts[],
): Contacts[] {
    return existing_contacts.filter((existing) => {
        const input_subscriptions = input_contacts_map.get(existing.email.toLowerCase())
        if (!input_subscriptions) return false // l'email non è tra gli input: escludi

        return input_subscriptions.every((subscription) => existing.subscriptions?.includes(subscription))
    })
}

function get_contacts_to_resubscribe(
    existing_contacts: Contacts[],
    already_subscribed_contacts: Contacts[],
): Contacts[] {
    const already_subscribed_uuids = new Set(already_subscribed_contacts.map((contact) => contact.uuid))

    return existing_contacts.filter((contact) => !already_subscribed_uuids.has(contact.uuid))
}

function get_contracts_to_create(
    input_contacts_normalized: Subscribe_Contact[],
    existing_contacts: Contacts[],
): Subscribe_Contact[] {
    const existing_contacts_email_set = new Set(existing_contacts.map((c) => c.email.toLowerCase()))

    return input_contacts_normalized.filter(
        (c) => c.email && !existing_contacts_email_set.has(c.email.toLowerCase()),
    )
}

async function update_contacts(
    input_contacts_map: Map<string, ContactSubscriptions[]>,
    contacts_to_resubscribe: Contacts[],
): Promise<Contacts[]> {
    const contacts = contacts_to_resubscribe.map((c) => ({
        uuid: c.uuid,
        subscriptions: Array.from(
            new Set([...(c.subscriptions ?? []), ...(input_contacts_map.get(c.email) ?? [])]),
        ),
    }))

    return await sql.update<Contacts[]>('contacts', contacts)
}

async function create_contacts(
    input_contacts_map: Map<string, ContactSubscriptions[]>,
    contacts_to_create: Subscribe_Contact[],
): Promise<Contacts[]> {
    const contacts = contacts_to_create.map((c) => ({
        email: c.email,
        status: ContactStatus.lead,
        subscriptions: input_contacts_map.get(c.email) ?? [],
    }))

    return await sql.insert<Contacts[]>('contacts', contacts)
}

function build_for_events_batch_data(contacts: {
    already_subscribed: Contacts[]
    updated: Contacts[]
    created: Contacts[]
}): EventsMutator[] {
    return [
        ...contacts.already_subscribed.map((c) => ({
            contact_uuid: c.uuid,
            details: CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED,
        })),
        ...contacts.updated.map((c) => ({
            contact_uuid: c.uuid,
            details: CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED,
        })),
        ...contacts.created.map((c) => ({
            contact_uuid: c.uuid,
            details: CONTACT_RESPONSE_OUTCOME.NEW_CONTACT,
        })),
    ]
}

function build_response(contacts: {
    already_subscribed: Contacts[]
    updated: Contacts[]
    created: Contacts[]
}): Subscribe_Contacts_Response {
    return [
        ...contacts.already_subscribed.map((c) => ({
            email: c.email,
            outcome: CONTACT_RESPONSE_OUTCOME.ALREADY_SUBSCRIBED,
        })),
        ...contacts.updated.map((c) => ({ email: c.email, outcome: CONTACT_RESPONSE_OUTCOME.RESUBSCRIBED })),
        ...contacts.created.map((c) => ({ email: c.email, outcome: CONTACT_RESPONSE_OUTCOME.NEW_CONTACT })),
    ]
}
