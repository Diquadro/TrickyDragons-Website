// SendGrid specific options
export interface SendGrid_Options {
    headers?: Record<string, string>
}

// Email sending options
export interface Email_Options {
    sendgrid?: SendGrid_Options
}
