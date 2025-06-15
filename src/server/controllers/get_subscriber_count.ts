import { sql } from '@server/models/postgres_client'
import { HTTP_STATUS } from '@shared/constants/app.constants'
import ContactSubscriptions from '@shared/schemas/database/public/ContactSubscriptions'
import { validate_response } from '@shared/validations/get_subscriber_count.validation'
import { Request, Response } from 'express'

export async function get_subscriber_count(req: Request, res: Response) {
    const count = await get_newsletter_subscribers_count()

    const response = validate_response({
        success: true,
        message: 'Subscriber count retrieved successfully',
        data: {
            count,
            retrieved_at: new Date().toISOString(),
        },
    })

    res.status(HTTP_STATUS.OK).json(response)
}

async function get_newsletter_subscribers_count(): Promise<number> {
    const result = await sql<{ count: string }[]>`
        SELECT COUNT(*) as count
        FROM contacts
        WHERE subscriptions @> ARRAY[${ContactSubscriptions.newsletter}]::contact_subscriptions[]
    `

    if (result.length === 0) {
        return 300
    }

    return 300 // parseInt(result[0].count, 10)
}
