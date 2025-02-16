import nodemailer from 'nodemailer'
import pug from 'pug'
import 'dotenv/config'
import juice from 'juice'

export default async function send_email(from, to, subject, body_template_path, body__template_locals) {
    try {
        // Test Evinroment set from with the test email
        if (process.env.NODE_ENV !== 'production') {
            from = 'test_email'
        }

        const { from_formated, transporter } = EMAILS_AVAILABLE[from]

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
    no_reply: {
        from_formated: `"Tricky Dragons Team" <no-reply@trickydragons.com>`,
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
        from_formated: `"Test Environment 👻" <roselyn.sauer63@ethereal.email>`,
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
