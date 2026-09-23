import nodemailer, { Transporter } from 'nodemailer'
import { ENV } from '@shared/constants/app.constants'

export const EMAIL_TEMPLATES = {
    WELCOME: 'v1_welcome',
    WELCOME_RESERVATION: 'v1_welcome_reservation',
    WELCOME_NON_VIP_1: 'v1_welcome_non_vip_1',
    WELCOME_NON_VIP_2: 'v1_welcome_non_vip_2',
    WELCOME_VIP_1: 'v1_welcome_vip_1',
    WELCOME_VIP_2: 'v1_welcome_vip_2',
    PRE_LAUNCH_NON_VIP_1: 'v1_pre_launch_non_vip_1',
    PRE_LAUNCH_VIP_1: 'v1_pre_launch_vip_1',
    PRE_LAUNCH_NON_VIP_2: 'v1_pre_launch_non_vip_2',
    PRE_LAUNCH_VIP_2: 'v1_pre_launch_vip_2',
    LAUNCH_ALL_1: 'v1_launch_all_1',
    LAUNCH_ALL_2: 'v1_launch_all_2',
    LAUNCH_ALL_3: 'v1_launch_all_3',
}

export const EMAIL_SENDERS = {
    NOREPLY: '"Tricky Dragons Team" <noreply@trickydragons.com>',
    DANIELE_DAMBROSIO_INFO: '"Daniele D\'Ambrosio from Tricky Dragons" <info@trickydragons.com>',
    INFO: '"Tricky Dragons Team" <info@trickydragons.com>',
}

export const EMAIL_TRANSPORTERS: Record<string, Transporter> = {
    ethereal_test_local: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.ETHEREAL_TEST_LOCAL_EMAIL_USER,
            pass: process.env.ETHEREAL_TEST_LOCAL_EMAIL_PASS,
        },
    }),
    smtp2go_transporter_prod: nodemailer.createTransport({
        host: 'mail.smtp2go.com',
        port: 2525,
        secure: false, // TLS on port 2525
        auth: {
            user: process.env.SMTP2GO_USERNAME_PROD,
            pass: process.env.SMTP2GO_PASSWORD_PROD,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 5000,
    }),
    smtp2go_transporter_prod_sandbox: nodemailer.createTransport({
        host: 'mail.smtp2go.com',
        port: 2525,
        secure: false, // TLS on port 2525
        auth: {
            user: process.env.SMTP2GO_USERNAME_PROD_SANDBOX,
            pass: process.env.SMTP2GO_PASSWORD_PROD_SANDBOX,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 5000,
    }),
}

export function getEmailTransporter(): Transporter {
    if (ENV.LOCAL) {
        return EMAIL_TRANSPORTERS.ethereal_test_local
    }
    if (ENV.DEVELOPMENT) {
        return EMAIL_TRANSPORTERS.smtp2go_transporter_prod_sandbox
    }
    return EMAIL_TRANSPORTERS.smtp2go_transporter_prod
}
