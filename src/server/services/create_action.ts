import { sql } from '@server/models/postgres_client'
import { ContactsUuid } from '@shared/schemas/database/public/Contacts'
import { OrdersUuid } from '@shared/schemas/database/public/Orders'
import ActionDirection from '@shared/schemas/database/public/ActionDirection'
import ActionOutcome from '@shared/schemas/database/public/ActionOutcome'
import Actions, { ActionsInitializer } from '@shared/schemas/database/public/Actions'
import { Request } from 'express'
import { Utm_Params_Schema } from '@shared/schemas/utm_params.schema'

interface action_data {
    action: string
    contact_uuid: ContactsUuid
    details?: Record<string, any>
    outcome?: ActionOutcome
    order_uuid?: OrdersUuid

    // HTTP Request context (for regular endpoints)
    req?: Request
    utm_params?: Utm_Params_Schema

    // Manual override fields (for webhooks or custom actions)
    endpoint?: string
    origin?: string
    occurred_at?: Date
    local_occurred_at?: Date
    timezone?: string
    city?: string
    region?: string
    country?: string
    latitude?: number
    longitude?: number
    payload?: Record<string, any>
    ab_test_variant?: string
}

export async function create_action(action_data: action_data) {
    const {
        action,
        req,
        contact_uuid,
        details,
        utm_params,
        timezone,
        order_uuid,
        outcome,
        endpoint,
        origin,
        occurred_at,
        local_occurred_at,
        city,
        region,
        country,
        latitude,
        longitude,
        payload,
        ab_test_variant,
    } = action_data

    const action_event: ActionsInitializer = {
        action: action,
        direction: ActionDirection.inbound,
        endpoint: endpoint || (req ? `${req.method} - ${req.originalUrl}` : 'UNKNOWN'),
        origin: origin || (req ? req.get('Referrer') : null),
        occurred_at: occurred_at || (req ? req.time_infos?.utc_occurred_at : null) || new Date(),
        local_occurred_at: local_occurred_at || (req ? req.time_infos?.local_occurred_at : null) || null,
        outcome: outcome ?? ActionOutcome.success,
        details: details,
        payload: payload || null,
        contact_uuid: contact_uuid,
        order_uuid: order_uuid,
        city: city || (req ? req.geo_infos?.city : null),
        region: region || (req ? req.geo_infos?.region : null),
        country: country || (req ? req.geo_infos?.country : null),
        timezone: timezone || (req ? req.geo_infos?.timezone : null),
        latitude: latitude || (req ? req.geo_infos?.latitude : null),
        longitude: longitude || (req ? req.geo_infos?.longitude : null),
        utm_source: utm_params?.utm_source,
        utm_medium: utm_params?.utm_medium,
        utm_campaign: utm_params?.utm_campaign,
        utm_term: utm_params?.utm_term,
        utm_content: utm_params?.utm_content,
        ab_test_variant: ab_test_variant || null,
    }

    return sql.insert<Actions[]>('actions', [action_event])
}
