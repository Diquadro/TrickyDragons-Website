import nodemailer, { Transporter } from 'nodemailer'
import pug from 'pug'
import juice from 'juice'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { API_URL, CLIENT_URL, IS_PROD } from '@shared/constants'
import { custom_error, VALIDATION_ERROR } from '@server_utils/custom_errors'
import Contacts from 'src/schemas/public/Contacts'
import base64url from 'base64url'
import { Emails_Helpers } from '../helpers/emails.helpers'
import path from 'path'

export class Emails_Services {
    static async send_welcome(contacts: Contacts[]) {
        // Validate Input
        const validation = Emails_Helpers.validate_input_send_welcome(contacts)
        if (!validation.success) {
            throw custom_error(VALIDATION_ERROR, validation.error.errors)
        }

        for (const contact of contacts) {
            const from = 'no_reply'
            const to = contact.email
            const subject = 'Welcome to the world of Tricky Dragons – Your Adventure Awaits'
            const body_template_path = path.resolve(
                __dirname,
                '../emails/email_subscription/email_subscription.pug',
            )

            const email_deactivation_url_data64 = base64url.encode(
                JSON.stringify({
                    origin: 'email',
                    redirect_url: `${CLIENT_URL}/email_deactivation?data64=${base64url.encode(contact.uuid)}`,
                }),
            )

            const kickstarter_url_data64 = base64url.encode(
                JSON.stringify({
                    origin: 'email',
                    redirect_url: `https://www.kickstarter.com/projects/2076650099/tricky-dragons`,
                }),
            )

            const instagram_url_data64 = base64url.encode(
                JSON.stringify({
                    origin: 'email',
                    redirect_url: `https://www.instagram.com/trickydragons`,
                }),
            )

            const redirect_url = `${API_URL}/v1/redirects/`

            const body_template_locals = {
                email_deactivation: `${redirect_url}${email_deactivation_url_data64}`,
                kickstarter_url: `${redirect_url}${kickstarter_url_data64}`,
                instagram_url: `${redirect_url}${instagram_url_data64}`,
            }

            await Emails_Services.send_email(from, to, subject, body_template_path, body_template_locals)
        }
    }

    private static async send_email(
        from: string,
        to: string,
        subject: string,
        body_template_path: string,
        body_template_locals: any,
    ) {
        // Test Evinroment set from with the test email
        if (!IS_PROD) {
            from = 'test_email'
        }

        const { from_formatted, transporter } = Emails_Services.EMAILS_AVAILABLE[from]

        // Render Pug template
        const raw_html = pug.renderFile(body_template_path, {
            ...body_template_locals,
            pretty: false,
        })

        // Apply inline styles using Juice
        const html = juice(raw_html)

        // email options
        const mailOptions = {
            from: from_formatted,
            to: to,
            subject: subject,
            html: html,
        }

        // send email
        return await transporter.sendMail(mailOptions)
    }

    private static readonly EMAILS_AVAILABLE: Record<
        string,
        {
            from_formatted: string
            transporter: Transporter<SMTPTransport.SentMessageInfo>
        }
    > = {
        no_reply: {
            from_formatted: `"Tricky Dragons Team" <no-reply@trickydragons.com>`,
            transporter: nodemailer.createTransport({
                host: 'smtp.zoho.eu',
                port: 465,
                secure: true,
                auth: {
                    user: 'no-reply@trickydragons.com',
                    pass: process.env.NO_REPLY_EMAIL_PASS,
                },
            }),
        },
        test_email: {
            from_formatted: `"Test Environment 👻" <roselyn.sauer63@ethereal.email>`,
            transporter: nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'roselyn.sauer63@ethereal.email',
                    pass: process.env.TEST_EMAIL_PASS,
                },
            }),
        },
    }
}
