import { HTTP_STATUS } from '@shared/constants/app.constants'
import { Request, Response } from 'express'
import { update_analytics_event } from '@server/services/update_analytics_event'
import { validate_request, validate_response } from '@shared/validations/update_analytics_event.validation'

/**
 * Update analytics event controller
 * Updates the occurred_at timestamp of an existing event
 */
export async function update_analytics_event_http(req: Request, res: Response) {
    // Validate request body - throws error if validation fails (caught by error_handler middleware)
    const request_data = validate_request(req.body)
    const { event_id, occurred_at } = request_data

    // Update analytics event in database
    const updated_event = await update_analytics_event(
        event_id,
        occurred_at ? new Date(occurred_at) : new Date(),
    )

    // Prepare and validate success response
    const response = validate_response({
        success: true,
        message: 'Analytics event updated successfully',
        data: {
            event_id: updated_event.uuid,
            updated_at: updated_event.updated_date.toISOString(),
            occurred_at: updated_event.occurred_at.toISOString(),
        },
    })

    res.status(HTTP_STATUS.OK).json(response)

    // REQUEST ENDS HERE
    // Any post-processing can be done here without affecting response time
}
