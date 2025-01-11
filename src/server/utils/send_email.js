import { log } from 'console'
import nodemailer from 'nodemailer'
import pug from 'pug'

export default async function send_email(from, to, subject, body_template_path, body__template_locals) {
    try {
        // email transporter configuration
        const transporter = nodemailer.createTransport({
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
        })

        const html = pug.renderFile(body_template_path, body__template_locals)
        console.log(html)

        // email options
        const mailOptions = {
            from: from,
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
