import { send_html_email } from '@server/services/send_html_email'
import path from 'path'
import { Base64_Url } from '@shared/utils/base64_url'
import { LINKS } from '@shared/constants/links.constants'
import { API, ENV } from '@shared/constants/app.constants'
import { redirect_payload_schema } from '@shared/validations/redirect.validation'
import { EMAIL_TEMPLATES, EMAIL_SENDERS } from '@shared/constants/emails.constants'

export const send_welcome_vip_2_email = async (contact_email: string, first_name?: string) => {
    const from = EMAIL_SENDERS.DANIELE_DAMBROSIO_INFO
    const to = contact_email
    const subject = 'Quick question about Tricky Dragons'
    const html_template_path = ENV.LOCAL
        ? path.resolve(__dirname, 'welcome_email_vip_2.html')
        : path.resolve(
              __dirname,
              '..',
              'shared/templates/emails/welcome_email_vip_2',
              'welcome_email_vip_2.html',
          )

    // Create redirect payloads with simplified structure
    const facebook_vip_group_payload = redirect_payload_schema.parse({
        redirect_url: LINKS.EXTERNAL.FACEBOOK_VIP_GROUP,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME_VIP_2,
            utm_medium: 'facebook_vip_group_link',
        },
    })

    const unsubscribe_payload = redirect_payload_schema.parse({
        redirect_url: `${LINKS.INTERNAL.NEWSLETTER.UNSUBSCRIBE}?utm_source=email&utm_campaign=${EMAIL_TEMPLATES.WELCOME_VIP_2}&utm_medium=unsubscribe_link`,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME_VIP_2,
            utm_medium: 'unsubscribe_link',
        },
        keep_data64: true,
    })

    // Encode payloads to Base64 using the encode_json method
    const facebook_vip_group_url_data64 = Base64_Url.encode_json(facebook_vip_group_payload)
    const unsubscribe_url_data64 = Base64_Url.encode_json(unsubscribe_payload)

    const redirect_endpoint = API.ENDPOINTS.REDIRECTS.REDIRECT

    const template_variables = {
        First_Name: first_name || 'Dragon Enthusiast', // Fallback se il nome non è disponibile
        FACEBOOK_VIP_GROUP_LINK: `${API.URL}${redirect_endpoint}?data64=${facebook_vip_group_url_data64}`,
        UNSUBSCRIBE_LINK: `${API.URL}${redirect_endpoint}?data64=${unsubscribe_url_data64}`,
    }

    // SMTP2GO tracking options with X-Category
    const smtp2go = {
        headers: {
            'X-Category': EMAIL_TEMPLATES.WELCOME_VIP_2,
        },
    }

    const email_options = { smtp2go }

    return await send_html_email(from, to, subject, html_template_path, template_variables, email_options)
}
