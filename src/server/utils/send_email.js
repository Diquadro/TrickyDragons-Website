import nodemailer from 'nodemailer'
import pug from 'pug'
import 'dotenv/config'
import juice from 'juice'

export default async function send_email(from, to, subject, body_template_path, body__template_locals) {
    try {
        const { from_formated, transporter } =
            process.env.NODE_ENV === 'production'
                ? EMAILS_AVAILABLE[from]
                : EMAILS_AVAILABLE['ethereal_email']

        // Render Pug template
        const raw_html = pug.renderFile(body_template_path, {
            ...body__template_locals,
            pretty: false,
        })

        // Apply inline styles using Juice
        const html = juice(raw_html)

        // email options
        const mailOptions = {
            from: from_formated,
            to: to,
            subject: subject,
            html: html,
        }

        // send email
        await transporter.sendMail(mailOptions)

        return true
    } catch (err) {
        console.error('send_email - error message\n', err.message)

        return false
    }
}

const EMAILS_AVAILABLE = {
    'no-reply@trickydragons.com': {
        from_formated: `"Tricky Dragons Team" <${process.env.NO_REPLY_EMAIL_USER}>`,
        transporter: nodemailer.createTransport({
            host: process.env.NO_REPLY_EMAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.NO_REPLY_EMAIL_USER,
                pass: process.env.NO_REPLY_EMAIL_PASS,
            },
        }),
    },
    ethereal_email: {
        from_formated: `"Test Environment 👻" <${process.env.TEST_EMAIL_USER}>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.TEST_EMAIL_USER,
                pass: process.env.TEST_EMAIL_PASS,
            },
        }),
    },
    'trickydragons.cardgame@gmail.com': {
        from_formated: `"Tricky Dragons Team" <${process.env.EMAIL_USER}>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.G_API_CLIENTE_ID,
                clientSecret: process.env.G_API_CLIENT_SECRET,
                refreshToken: process.env.G_API_REFRESH_TOKEN,
            },
        }),
    },
}
