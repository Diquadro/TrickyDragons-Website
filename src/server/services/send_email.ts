import pug from 'pug'
import juice from 'juice'
import { ENV } from '@shared/constants/app.constants'
import { EMAILS_AVAILABLE } from '@shared/constants/emails.constants'
import { type Email_Options } from '@shared/types/email_options'

export async function send_email(
    from: string,
    to: string,
    subject: string,
    body_template_path: string,
    body_template_locals: any = {},
    email_options: Email_Options = {},
) {
    // Force SendGrid if explicitly requested (for testing)
    if (process.env.SENDGRID_FORCE === 'true') {
        from = 'sendgrid_smtp'
    } else if (ENV.LOCAL) {
        // Test Environment set from with the test email
        from = 'ethereal_test_local'
    } else if (ENV.DEVELOPMENT) {
        from = 'zoho_test_dev'
    }

    // Render Pug template and apply styles using Juice
    const pug_options = {
        ...body_template_locals,
        pretty: false,
    }
    const raw_html = pug.renderFile(body_template_path, pug_options)
    const html = juice(raw_html)

    const { from_formatted, transporter } = EMAILS_AVAILABLE[from]

    // Initialize mail options
    const mail_options: any = {}

    // Base email properties
    mail_options.from = from_formatted
    mail_options.to = to
    mail_options.subject = subject
    mail_options.html = html

    // SendGrid-specific options via direct headers
    if (from === 'sendgrid_smtp' && email_options.sendgrid?.headers) {
        mail_options.headers = email_options.sendgrid.headers
    }

    // send email
    return await transporter.sendMail(mail_options)
}
