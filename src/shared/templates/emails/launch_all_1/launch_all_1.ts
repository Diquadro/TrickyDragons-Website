import { send_html_email } from '@server/services/send_html_email'
import path from 'path'
import { Base64_Url } from '@shared/utils/base64_url'
import { LINKS } from '@shared/constants/links.constants'
import { API } from '@shared/constants/app.constants'
import { redirect_payload_schema } from '@shared/validations/redirect.validation'
import { EMAIL_TEMPLATES, EMAIL_SENDERS } from '@shared/constants/emails.constants'

export const send_launch_all_1_email = async (contact_email: string) => {
    const from = EMAIL_SENDERS.INFO
    const to = contact_email
    const subject = 'Tricky Dragons is LIVE on Kickstarter 🐲'
    // Always resolved next to this file - only ever run via tsx directly
    // (src/server/scripts/send_launch_all_email.ts), never through the esbuild-bundled server.
    const html_template_path = path.resolve(__dirname, 'launch_all_1.html')

    const unsubscribe_payload = redirect_payload_schema.parse({
        redirect_url: `${LINKS.INTERNAL.NEWSLETTER.UNSUBSCRIBE}?utm_source=email&utm_campaign=${EMAIL_TEMPLATES.LAUNCH_ALL_1}&utm_medium=unsubscribe_link`,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.LAUNCH_ALL_1,
            utm_medium: 'unsubscribe_link',
        },
        keep_data64: true,
    })

    const unsubscribe_url_data64 = Base64_Url.encode_json(unsubscribe_payload)

    const redirect_endpoint = API.ENDPOINTS.REDIRECTS.REDIRECT

    const template_variables = {
        UNSUBSCRIBE_LINK: `${API.URL}${redirect_endpoint}?data64=${unsubscribe_url_data64}`,
    }

    // SMTP2GO tracking options with X-Category
    const smtp2go = {
        headers: {
            'X-Category': EMAIL_TEMPLATES.LAUNCH_ALL_1,
        },
    }

    const email_options = { smtp2go }

    return await send_html_email(from, to, subject, html_template_path, template_variables, email_options)
}
