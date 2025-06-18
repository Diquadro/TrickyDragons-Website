import { ENV } from '@shared/constants/app.constants'
import { sql } from '@server/models/postgres_client'
import { META } from '@shared/constants/app.constants'
import Contacts from '@shared/schemas/database/public/Contacts'
import { utm_params } from '@shared/types/utm_params'
import { Request } from 'express'
import crypto from 'crypto'
import * as Meta_Api from 'facebook-nodejs-business-sdk'

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN as string
const PIXEL_ID = process.env.META_PIXEL_ID as string

export async function send_meta_event(
    event_name: string,
    event_id: string | null,
    req: Request,
    contact_uuid: string,
    utm_params?: utm_params,
) {
    const contact_email = await get_contact_email(contact_uuid)
    const event = create_event(event_name, event_id, req, contact_email, utm_params)
    const request = new Meta_Api.EventRequest(ACCESS_TOKEN, PIXEL_ID)

    // Add test event code if not in production
    if (!ENV.PRODUCTION) {
        if (!META.TEST_EVENT_CODE) throw new Error('Test event code is not set')
        request.setTestEventCode(META.TEST_EVENT_CODE)
    }

    request.setEvents([event])

    return await request.execute()
}

async function get_contact_email(contact_uuid: string) {
    const contacts = await sql<Contacts[]>`
        SELECT email
        FROM contacts
        WHERE uuid = ${contact_uuid}
    `

    if (contacts.length === 0) {
        return null
    }

    return contacts[0].email
}

function create_event(
    event_name: string,
    event_id: string | null,
    req: Request,
    contact_email: string | null,
    utm_params?: utm_params,
): Meta_Api.ServerEvent {
    // Create user data object with all available information
    const user_data = new Meta_Api.UserData()

    // Set non-hashed fields
    const user_agent = req.get('User-Agent')
    if (user_agent) user_data.setClientUserAgent(user_agent)

    const client_ip = req.clientIp || req.ip
    if (client_ip) user_data.setClientIpAddress(client_ip)

    const fbp = req.cookies?._fbp
    if (fbp) user_data.setFbp(fbp)

    const fbc = req.cookies?._fbc
    if (fbc) user_data.setFbc(fbc)

    // Set hashed fields - only hash if the value exists
    if (contact_email?.trim()) user_data.setEmail(hash(contact_email))

    const city = req.geo_infos?.city?.trim()
    if (city) user_data.setCity(hash(city))

    // Use short codes for Meta - more appropriate format
    const short_region = req.geo_infos?.short_region?.trim()
    if (short_region) user_data.setState(hash(short_region))

    const short_country = req.geo_infos?.short_country?.trim()
    if (short_country) user_data.setCountry(hash(short_country))

    // Create server event with basic data
    const server_event = new Meta_Api.ServerEvent()
        .setEventName(event_name)
        .setEventTime(Math.floor(Date.now() / 1000))
        .setUserData(user_data)
        .setActionSource('website')

    const event_source_url = req.get('Referrer')
    if (event_source_url) server_event.setEventSourceUrl(event_source_url)
    if (event_id) server_event.setEventId(event_id)

    // Set attribution data if UTM params contain Meta ad IDs
    if (
        utm_params?.utm_custom_ad_id &&
        utm_params?.utm_custom_adset_id &&
        utm_params?.utm_custom_campaign_id
    ) {
        const attribution_data = {
            ad_id: utm_params.utm_custom_ad_id,
            adset_id: utm_params.utm_custom_adset_id,
            campaign_id: utm_params.utm_custom_campaign_id,
            visit_time: Math.floor(Date.now() / 1000),
        }

        server_event.setAttributionData(attribution_data as any)
    }

    return server_event
}

function hash(value: string): string {
    return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}
