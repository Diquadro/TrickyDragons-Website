import nodemailer, { Transporter } from 'nodemailer'

export const EMAIL_TEMPLATES = {
    WELCOME: 'v1_welcome',
    WELCOME_RESERVATION: 'v1_welcome_reservation',
    WELCOME_NON_VIP_1: 'v1_welcome_non_vip_1',
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
    sendgrid_smtp: {
        from_formatted: `"Tricky Dragons Team" <${process.env.SENDGRID_FROM_EMAIL}>`,
        transporter: nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false, // TLS on port 587
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        }),
    },
    smtp2go_no_reply_prod: {
        from_formatted: `"Tricky Dragons Team" <noreply@trickydragons.com>`,
        transporter: nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false, // TLS on port 2525
            auth: {
                user: process.env.SMTP2GO_USERNAME_PROD,
                pass: process.env.SMTP2GO_PASSWORD_PROD,
            },
        }),
    },
    smtp2go_no_reply_prod_sandbox: {
        from_formatted: `"Tricky Dragons Team" <noreply@trickydragons.com>`,
        transporter: nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false, // TLS on port 2525
            auth: {
                user: process.env.SMTP2GO_USERNAME_PROD_SANDBOX,
                pass: process.env.SMTP2GO_PASSWORD_PROD_SANDBOX,
            },
        }),
    },
    smtp2go_daniele_prod: {
        from_formatted: `"Daniele D'Ambrosio from Tricky Dragons" <info@trickydragons.com>`,
        transporter: nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false, // TLS on port 2525
            auth: {
                user: process.env.SMTP2GO_USERNAME_PROD,
                pass: process.env.SMTP2GO_PASSWORD_PROD,
            },
        }),
    },
    smtp2go_daniele_no_reply_prod: {
        from_formatted: `"Daniele D'Ambrosio from Tricky Dragons" <noreply@trickydragons.com>`,
        transporter: nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false, // TLS on port 2525
            auth: {
                user: process.env.SMTP2GO_USERNAME_PROD,
                pass: process.env.SMTP2GO_PASSWORD_PROD,
            },
        }),
    },
}
