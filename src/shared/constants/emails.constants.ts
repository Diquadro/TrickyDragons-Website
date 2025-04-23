import nodemailer, { Transporter } from 'nodemailer'

export const EMAILS_AVAILABLE: Record<string, { from_formatted: string; transporter: Transporter }> = {
    zoho_no_reply: {
        from_formatted: `"Tricky Dragons Team" <no-reply@trickydragons.com>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: 'no-reply@trickydragons.com',
                pass: process.env.ZOHO_NO_REPLY_EMAIL_PASS,
            },
        }),
    },
    zoho_test_dev: {
        from_formatted: `"Test001-Dev001 Tricky Dragons Team" <test001.dev001@trickydragons.com>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: 'test001.dev001@trickydragons.com',
                pass: process.env.ZOHO_TEST_DEV_EMAIL_PASS,
            },
        }),
    },
    ethereal_test_local: {
        from_formatted: `"Test Environment 👻" <roselyn.sauer63@ethereal.email>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'roselyn.sauer63@ethereal.email',
                pass: process.env.ETHEREAL_TEST_LOCAL_EMAIL_PASS,
            },
        }),
    },
}

export const EMAIL_TEMPLATES = {
    WELCOME: 'v1_welcome',
}
