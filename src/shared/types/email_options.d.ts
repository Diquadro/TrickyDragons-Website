// SendGrid specific options
export interface SendGrid_Options {
    headers?: Record<string, string>
}

// SMTP2GO specific options  
export interface Smtp2go_Options {
    headers?: Record<string, string>
}

// Email sending options
export interface Email_Options {
    sendgrid?: SendGrid_Options
    smtp2go?: Smtp2go_Options
}
