import nodemailer from 'nodemailer'
import pug from 'pug'
import 'dotenv/config'

export default async function send_email(from, to, subject, body_template_path, body__template_locals) {
    return process.env.NODE_ENV === 'production'
        ? await email(from, to, subject, body_template_path, body__template_locals)
        : await test_email(subject, body_template_path, body__template_locals)
}

async function email(from, to, subject, body_template_path, body__template_locals) {
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

async function test_email(subject, body_template_path, body__template_locals) {
    try {
        // email transporter configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.TEST_EMAIL_USER,
                pass: process.env.TEST_EMAIL_PASS,
            },
        })

        const html = pug.renderFile(body_template_path, body__template_locals)

        // email options
        const mailOptions = {
            from: `"Roselyn Sauer 👻" <${process.env.TEST_EMAIL_USER}>`, // sender address
            to: 'bar@example.com, baz@example.com', // list of receivers
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
