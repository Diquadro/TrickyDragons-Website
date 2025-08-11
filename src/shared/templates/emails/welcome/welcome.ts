import { send_email } from '@server/services/send_email'
import path from 'path'
import { Base64_Url } from '@shared/utils/base64_url'
import { LINKS } from '@shared/constants/links.constants'
import { API, ENV } from '@shared/constants/app.constants'
import { redirect_payload_schema } from '@shared/validations/redirect.validation'
import { EMAIL_TEMPLATES } from '@shared/constants/emails.constants'

export const send_welcome_email = async (contact_email: string) => {
    const from = 'zoho_no_reply'
    const to = contact_email
    const subject = 'Welcome to the world of Tricky Dragons – Your Adventure Awaits'
    const body_template_path = ENV.LOCAL
        ? path.resolve(__dirname, 'welcome.pug')
        : path.resolve(__dirname, '..', 'shared/templates/emails/welcome', 'welcome.pug')

    // Create redirect payloads with simplified structure
    const kickstarter_payload = redirect_payload_schema.parse({
        redirect_url: LINKS.EXTERNAL.KICKSTARTER,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME,
            utm_medium: 'kickstarter_link',
        },
    })

    const instagram_payload = redirect_payload_schema.parse({
        redirect_url: LINKS.EXTERNAL.INSTAGRAM,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME,
            utm_medium: 'instagram_link',
        },
    })

    const unsubscribe_payload = redirect_payload_schema.parse({
        redirect_url: LINKS.INTERNAL.NEWSLETTER.UNSUBSCRIBE,
        email: contact_email,
        utm_params: {
            utm_source: 'email',
            utm_campaign: EMAIL_TEMPLATES.WELCOME,
            utm_medium: 'unsubscribe_link',
        },
        keep_data64: true,
    })

    // Encode payloads to Base64 using the encode_json method
    const kickstarter_url_data64 = Base64_Url.encode_json(kickstarter_payload)
    const instagram_url_data64 = Base64_Url.encode_json(instagram_payload)
    const email_deactivation_url_data64 = Base64_Url.encode_json(unsubscribe_payload)

    const redirect_endpoint = API.ENDPOINTS.REDIRECTS.REDIRECT

    const body_template_locals = {
        kickstarter_url: `${API.URL}${redirect_endpoint}?data64=${kickstarter_url_data64}`,
        instagram_url: `${API.URL}${redirect_endpoint}?data64=${instagram_url_data64}`,
        email_deactivation: `${API.URL}${redirect_endpoint}?data64=${email_deactivation_url_data64}`,
    }

    // Email sending options with tracking
    const sendgrid = {
        headers: {
            'X-SMTPAPI': JSON.stringify({
                category: EMAIL_TEMPLATES.WELCOME,
                unique_args: {
                    environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
                    template: EMAIL_TEMPLATES.WELCOME,
                },
            }),
        },
    }

    const email_options = { sendgrid }

    return await send_email(from, to, subject, body_template_path, body_template_locals, email_options)
}
