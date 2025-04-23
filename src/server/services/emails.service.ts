import pug from 'pug'
import juice from 'juice'
import { ENV } from '@shared/constants/app.constants'
import { EMAILS_AVAILABLE } from '@shared/constants/emails.constants'

export abstract class Emails_Service {
    static async send(
        from: string,
        to: string,
        subject: string,
        body_template_path: string,
        body_template_locals: any = {},
    ) {
        // Test Evinroment set from with the test email
        if (ENV.LOCAL) {
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

        // email options
        const mail_options = {
            from: from_formatted,
            to: to,
            subject: subject,
            html: html,
        }

        // send email
        return await transporter.sendMail(mail_options)
    }
}
