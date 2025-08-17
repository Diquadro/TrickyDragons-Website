import { send_html_email } from '@server/services/send_html_email'
import path from 'path'
import { Base64_Url } from '@shared/utils/base64_url'
import { LINKS } from '@shared/constants/links.constants'
import { API, ENV } from '@shared/constants/app.constants'
import { redirect_payload_schema } from '@shared/validations/redirect.validation'
import { EMAIL_TEMPLATES, EMAIL_SENDERS } from '@shared/constants/emails.constants'

export const send_welcome_non_vip_1_email = async (contact_email: string) => {
    const from = EMAIL_SENDERS.DANIELE_DAMBROSIO_INFO
    const to = contact_email
    const subject = 'Thank you and welcome to the world of Tricky Dragons!'
    const html_template_path = ENV.LOCAL
        ? path.resolve(__dirname, 'welcome_email_non_vip_1.html')
        : path.resolve(
              __dirname,
              '..',
              'shared/templates/emails/welcome_email_non_vip_1',
              'welcome_email_non_vip_1.html',
          )

    // Create redirect payloads with simplified structure
    const reservation_payload = redirect_payload_schema.parse({
        redirect_url: `${LINKS.INTERNAL.RESERVATION.WELCOME}?email=${Base64_Url.encode(contact_email)}&utm_source=email&utm_campaign=${EMAIL_TEMPLATES.WELCOME_NON_VIP_1}&utm_medium=reservation_link`,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME_NON_VIP_1,
            utm_medium: 'reservation_link',
        },
    })

    const unsubscribe_payload = redirect_payload_schema.parse({
        redirect_url: `${LINKS.INTERNAL.NEWSLETTER.UNSUBSCRIBE}?utm_source=email&utm_campaign=${EMAIL_TEMPLATES.WELCOME_NON_VIP_1}&utm_medium=unsubscribe_link`,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME_NON_VIP_1,
            utm_medium: 'unsubscribe_link',
        },
        keep_data64: true,
    })

    // Encode payloads to Base64 using the encode_json method
    const reservation_url_data64 = Base64_Url.encode_json(reservation_payload)
    const unsubscribe_url_data64 = Base64_Url.encode_json(unsubscribe_payload)

    const redirect_endpoint = API.ENDPOINTS.REDIRECTS.REDIRECT

    const template_variables = {
        RESERVATION_LINK: `${API.URL}${redirect_endpoint}?data64=${reservation_url_data64}`,
        UNSUBSCRIBE_LINK: `${API.URL}${redirect_endpoint}?data64=${unsubscribe_url_data64}`,
    }

    // SMTP2GO tracking options with X-Category
    const smtp2go = {
        headers: {
            'X-Category': EMAIL_TEMPLATES.WELCOME_NON_VIP_1,
        },
    }

    const email_options = { smtp2go }

    return await send_html_email(from, to, subject, html_template_path, template_variables, email_options)
}
