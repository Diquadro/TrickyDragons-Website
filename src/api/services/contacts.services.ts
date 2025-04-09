import Contacts from 'src/schemas/public/Contacts'
import ContactSubscriptions from 'src/schemas/public/ContactSubscriptions'
import ContactStatus from 'src/schemas/public/ContactStatus'
import { Contacts_Models } from '@api_models/contacts.models'
import { z } from 'zod'
import {
    custom_error,
    ALREADY_ASSOCIATED,
    DUPLICATE_RECORDS,
    RECORDS_NOT_FOUND,
    VALIDATION_ERROR,
} from '@api_utils/custom_errors'
import { sql } from '@api_models/models'
import { Contacts_Helpers } from '../helpers/contacts.helpers'

export class Contacts_Services {
    static async get_by_emails(contacts: Contacts[]) {
        const validation = Contacts_Helpers.validate_contacts_have_email(contacts)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        const emails = contacts.map((c) => c.email)
        const db_contacts = await Contacts_Models.get_by_emails(emails)

        if (db_contacts.length <= 0) {
            throw custom_error(RECORDS_NOT_FOUND, contacts)
        }

        return db_contacts
    }

    static async get_by_uuids(contacts: Contacts[]) {
        const validation = Contacts_Helpers.validate_contacts_have_uuid(contacts)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        const uuids = contacts.map((c) => c.uuid)
        return Contacts_Models.get_by_emails(uuids)
    }

    static async create_lead(contacts: Contacts[]) {
        // Validate Input
        const validation = Contacts_Helpers.validate_contacts_have_email(contacts)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        // Check for duplicates already in the DB
        const emails = contacts.map((c) => c.email)
        const existing_contacts = await Contacts_Models.get_by_emails(emails)
        if (existing_contacts.length > 0) {
            const duplicated = contacts.filter((c) => existing_contacts.some((e) => e.email === c.email))
            throw custom_error(DUPLICATE_RECORDS, duplicated)
        }

        // Prepare contacts for creation
        const contacts_create = contacts.map((c) => ({
            email: c.email,
            status: ContactStatus.lead,
        }))

        return await sql.insert('contacts', contacts_create)
    }

    static async subscribe_to_newsletter(contacts: Contacts[]) {
        // Validate Input
        const validation = Contacts_Helpers.validate_contacts_have_email(contacts)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        // Retrieve contacts from DB by email
        const emails = contacts.map((c) => c.email)
        const db_contacts = await Contacts_Models.get_by_emails(emails)

        // Return error if some contacts are not found
        if (db_contacts.length !== contacts.length) {
            const db_emails = new Set(db_contacts.map((c) => c.email))
            const not_found = contacts.filter((c) => !db_emails.has(c.email))
            throw custom_error(RECORDS_NOT_FOUND, not_found)
        }

        // Check if any contact is already subscribed
        const already_subscribed = db_contacts
            .filter((c) => c.subscriptions?.includes(ContactSubscriptions.newsletter))
            .map(({ uuid, email }) => ({ uuid, email }))
        if (already_subscribed.length > 0) {
            throw custom_error(ALREADY_ASSOCIATED, already_subscribed)
        }

        // Prepare contacts for update
        const contacts_to_update = db_contacts.map((c) => ({
            uuid: c.uuid,
            subscriptions: [...(c.subscriptions ?? []), ContactSubscriptions.newsletter],
        }))

        return await sql.update('contacts', contacts_to_update)
    }

    static async unsubscribe_to_newsletter(contacts: Contacts[]) {
        // Validate Input
        const validation = Contacts_Helpers.validate_contacts_have_email(contacts)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        // Retrieve contacts from DB by email
        const emails = contacts.map((c) => c.email)
        const db_contacts = await Contacts_Models.get_by_emails(emails)

        // Return error if some contacts are not found
        if (db_contacts.length !== contacts.length) {
            const db_emails = new Set(db_contacts.map((c) => c.email))
            const not_found = contacts.filter((c) => !db_emails.has(c.email))
            throw custom_error(RECORDS_NOT_FOUND, not_found)
        }

        // Check if any contact is NOT subscribed
        const not_subscribed = db_contacts
            .filter((c) => !c.subscriptions?.includes(ContactSubscriptions.newsletter))
            .map(({ uuid, email }) => ({ uuid, email }))

        if (not_subscribed.length > 0) {
            throw custom_error(ALREADY_ASSOCIATED, not_subscribed)
        }

        // Prepare contacts for update
        const contacts_to_update = db_contacts.map((c: Contacts) => ({
            uuid: c.uuid,
            subscriptions: c.subscriptions.filter((s) => s !== ContactSubscriptions.newsletter),
        }))

        return await sql.update('contacts', contacts_to_update)
    }
}
