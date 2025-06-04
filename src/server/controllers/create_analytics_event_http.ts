import { HTTP_STATUS } from '@shared/constants/app.constants'
import { validate_request, validate_response } from '@shared/validations/analytics_event.validation'
import { Request, Response } from 'express'
import { create_analytics_event } from '@server/services/create_analytics_event'

/**
 * Create analytics event controller
 * Handles incoming analytics events from the frontend
 */
export async function create_analytics_event_http(req: Request, res: Response) {
    // Validate request body
    const event_data = validate_request(req.body)

    // Create analytics event in database using middleware-extracted data
    const created_event = await create_analytics_event(event_data, req)

    // Prepare success response
    const response = validate_response({
        success: true,
        message: 'Analytics event created successfully',
        data: {
            event_id: created_event.uuid,
            processed_at: created_event.created_date.toISOString(),
        },
    })

    res.status(HTTP_STATUS.CREATED).json(response)

    // REQUEST ENDS HERE
    // Any post-processing can be done here without affecting response time
}
