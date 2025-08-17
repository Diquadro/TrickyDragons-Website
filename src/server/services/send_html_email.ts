import fs from 'fs/promises'
import { ENV } from '@shared/constants/app.constants'
import { EMAIL_SENDERS, getEmailTransporter } from '@shared/constants/emails.constants'
import { type Email_Options } from '@shared/types/email_options'

/**
 * Strategy for handling unprocessed placeholders in HTML templates
 */
export enum PlaceholderStrategy {
    ERROR = 'error', // Throw error if placeholder not found
    WARNING = 'warning', // Log warning but continue
    SILENT = 'silent', // Leave placeholder intact
}

/**
 * Process HTML template with variable substitution
 * @param html_content Raw HTML content
 * @param variables Object with placeholder variables
 * @param strategy How to handle unprocessed placeholders
 * @returns Processed HTML string
 */
function process_html_template(
    html_content: string,
    variables: Record<string, string>,
    strategy: PlaceholderStrategy = ENV.PRODUCTION ? PlaceholderStrategy.WARNING : PlaceholderStrategy.ERROR,
): string {
    let processed = html_content
    const processed_placeholders = new Set<string>()

    // Replace all placeholders
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')

        if (processed.includes(placeholder)) {
            processed = processed.replace(regex, value)
            processed_placeholders.add(key)
        }
    }

    // Check for unprocessed placeholders
    const unprocessed_placeholders = processed.match(/{{[A-Z_]+}}/g) || []

    if (unprocessed_placeholders.length > 0) {
        const message = `Unprocessed placeholders found: ${unprocessed_placeholders.join(', ')}`

        switch (strategy) {
            case PlaceholderStrategy.ERROR:
                throw new Error(message)
            case PlaceholderStrategy.WARNING:
                console.warn(`⚠️ ${message}`)
                break
            case PlaceholderStrategy.SILENT:
                // Do nothing
                break
        }
    }

    if (ENV.LOCAL && processed_placeholders.size > 0) {
        console.log(`✅ Processed placeholders: ${Array.from(processed_placeholders).join(', ')}`)
    }

    return processed
}

/**
 * Send email using HTML template with placeholder substitution
 * @param from Email sender configuration key
 * @param to Recipient email address
 * @param subject Email subject
 * @param html_template_path Path to HTML template file
 * @param template_variables Variables for placeholder substitution
 * @param email_options Email service specific options
 * @param placeholder_strategy Strategy for handling unprocessed placeholders
 * @returns Promise resolving to email send result
 */
export async function send_html_email(
    from: string,
    to: string,
    subject: string,
    html_template_path: string,
    template_variables: Record<string, string> = {},
    email_options: Email_Options = {},
    placeholder_strategy?: PlaceholderStrategy,
) {
    try {
        // Read HTML template file
        const raw_html = await fs.readFile(html_template_path, 'utf-8')

        // Process template with variable substitution
        const html = process_html_template(raw_html, template_variables, placeholder_strategy)

        const transporter = getEmailTransporter()

        // Initialize mail options
        const mail_options: any = {}

        // Base email properties
        mail_options.from = from // Now `from` is already the formatted email address
        mail_options.to = to
        mail_options.subject = subject
        mail_options.html = html

        // SMTP2GO-specific options via direct headers
        if (ENV.DEVELOPMENT || ENV.PRODUCTION) {
            // Only for SMTP2GO transporters
            if (email_options.smtp2go?.headers) {
                mail_options.headers = email_options.smtp2go.headers
            }
        }

        // Log preview URL for ethereal in local environment
        if (ENV.LOCAL) {
            const result = await transporter.sendMail(mail_options)
            if (result.messageId && 'getTestMessageUrl' in transporter) {
                const preview_url = require('nodemailer').getTestMessageUrl(result)
                console.log(`📧 Email sent to ${to}`)
                console.log(`🔍 Preview URL: ${preview_url}`)
            }
            return result
        }

        return await transporter.sendMail(mail_options)
    } catch (error) {
        console.error('❌ Failed to send HTML email:', error)
        throw error
    }
}
