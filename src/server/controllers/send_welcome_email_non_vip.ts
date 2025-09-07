import { Request, Response } from 'express'
import { send_welcome_non_vip_1_email } from '@shared/templates/emails/welcome_email_non_vip_1/welcome_email_non_vip_1'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'
import { verify_contact_eligibility_for_welcome_email } from '@server/services/welcome_email_verification_service'
import { mark_email_as_sent } from '@server/services/email_tracking_service'
import { HTTP_STATUS } from '@shared/constants/app.constants'
import {
    validate_request,
    validate_response,
    type Welcome_Email_Request,
    type Welcome_Email_Response,
} from '@shared/validations/welcome_email.validation'

export async function send_welcome_email_non_vip_controller(req: Request, res: Response) {
    // Validate request with Zod
    const { contact_email }: Welcome_Email_Request = validate_request(req.body)

    // Verify contact eligibility - FAIL FAST
    const contact = await verify_contact_eligibility_for_welcome_email(
        contact_email,
        EMAIL_TEMPLATES.WELCOME_NON_VIP_1,
    )

    // Send email
    await send_welcome_non_vip_1_email(contact_email)

    // Mark email as sent
    await mark_email_as_sent(contact.uuid, EMAIL_TEMPLATES.WELCOME_NON_VIP_1)

    const response: Welcome_Email_Response = {
        success: true,
        message: 'Non-VIP welcome email sent successfully',
    }

    const validated_response = validate_response(response)
    return res.status(HTTP_STATUS.OK).json(validated_response)
}
