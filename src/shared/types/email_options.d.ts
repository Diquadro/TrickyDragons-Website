// SMTP2GO specific options
export interface Smtp2go_Options {
    headers?: Record<string, string>
}

// Email sending options
export interface Email_Options {
    smtp2go?: Smtp2go_Options
}
