import pug from 'pug'
import juice from 'juice'
import { ENV } from '@shared/constants/app.constants'
import { EMAIL_SENDERS, getEmailTransporter } from '@shared/constants/emails.constants'
import { type Email_Options } from '@shared/types/email_options'

export async function send_email(
    from: string,
    to: string,
    subject: string,
    body_template_path: string,
    body_template_locals: any = {},
    email_options: Email_Options = {},
) {
    // Render Pug template and apply styles using Juice
    const pug_options = {
        ...body_template_locals,
        pretty: false,
    }
    const raw_html = pug.renderFile(body_template_path, pug_options)
    const html = juice(raw_html)

    const transporter = getEmailTransporter()

    // Initialize mail options
    const mail_options: any = {}

    // Base email properties
    mail_options.from = from // Now `from` is already the formatted email address
    mail_options.to = to
    mail_options.subject = subject
    mail_options.html = html

    // SMTP2GO-specific options via direct headers
    if (ENV.DEVELOPMENT || ENV.PRODUCTION) {
        // Only for SMTP2GO transporters
        if (email_options.smtp2go?.headers) {
            mail_options.headers = email_options.smtp2go.headers
        }
    }

    // Log preview URL for ethereal in local environment
    if (ENV.LOCAL) {
        const result = await transporter.sendMail(mail_options)
        if (result.messageId && 'getTestMessageUrl' in transporter) {
            const preview_url = require('nodemailer').getTestMessageUrl(result)
            console.log(`📧 Email sent to ${to}`)
            console.log(`🔍 Preview URL: ${preview_url}`)
        }
        return result
    }

    return await transporter.sendMail(mail_options)
}
