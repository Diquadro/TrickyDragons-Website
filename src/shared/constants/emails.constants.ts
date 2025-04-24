import nodemailer, { Transporter } from 'nodemailer'

export const EMAIL_TEMPLATES = {
    WELCOME: 'v1_welcome',
}

export const EMAILS_AVAILABLE: Record<string, { from_formatted: string; transporter: Transporter }> = {
    zoho_no_reply: {
        from_formatted: `"Tricky Dragons Team" <${process.env.ZOHO_NO_REPLY_EMAIL_USER}>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_NO_REPLY_EMAIL_USER,
                pass: process.env.ZOHO_NO_REPLY_EMAIL_PASS,
            },
        }),
    },
    zoho_test_dev: {
        from_formatted: `"Test001-Dev001 Tricky Dragons Team" <${process.env.ZOHO_TEST_DEV_EMAIL_USER}>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_TEST_DEV_EMAIL_USER,
                pass: process.env.ZOHO_TEST_DEV_EMAIL_PASS,
            },
        }),
    },
    ethereal_test_local: {
        from_formatted: `"Test Environment 👻" <${process.env.ETHEREAL_TEST_LOCAL_EMAIL_USER}>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_TEST_LOCAL_EMAIL_USER,
                pass: process.env.ETHEREAL_TEST_LOCAL_EMAIL_PASS,
            },
        }),
    },
}
