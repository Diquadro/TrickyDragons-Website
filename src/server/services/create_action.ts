import { sql } from '@server/models/postgres_client'
import { ContactsUuid } from '@shared/schemas/database/public/Contacts'
import ActionDirection from '@shared/schemas/database/public/ActionDirection'
import ActionOutcome from '@shared/schemas/database/public/ActionOutcome'
import Actions, { ActionsInitializer } from '@shared/schemas/database/public/Actions'
import { Request } from 'express'
import { Utm_Params_Schema } from '@shared/schemas/utm_params.schema'

interface action_data {
    action: string
    req: Request
    contact_uuid: ContactsUuid
    details?: Record<string, any>
    utm_params?: Utm_Params_Schema
    timezone?: string
}

export async function create_action(action_data: action_data) {
    const { action, req, contact_uuid, details, utm_params, timezone } = action_data

    const success_subscribe_event: ActionsInitializer = {
        action: action,
        direction: ActionDirection.inbound,
        endpoint: `${req.method} - ${req.originalUrl}`,
        origin: req.get('Referrer'),
        occurred_at: new Date(),
        outcome: ActionOutcome.success,
        details: details,
        contact_uuid: contact_uuid,
        city: req.geo_infos?.city,
        region: req.geo_infos?.region,
        country: req.geo_infos?.country,
        timezone: timezone ?? req.geo_infos?.timezone,
        latitude: req.geo_infos?.latitude,
        longitude: req.geo_infos?.longitude,
        utm_source: utm_params?.utm_source,
        utm_medium: utm_params?.utm_medium,
        utm_campaign: utm_params?.utm_campaign,
        utm_term: utm_params?.utm_term,
        utm_content: utm_params?.utm_content,
    }

    return sql.insert<Actions[]>('actions', [success_subscribe_event])
}
