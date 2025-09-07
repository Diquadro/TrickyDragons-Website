import { z } from 'zod'

export const welcome_email_request_schema = z.object({
    contact_email: z
        .string()
        .email('Valid email is required')
        .transform((email) => email.trim().toLowerCase()),
})

export const welcome_email_response_schema = z.object({
    success: z.boolean(),
    message: z.string(),
})

export type Welcome_Email_Request = z.infer<typeof welcome_email_request_schema>
export type Welcome_Email_Response = z.infer<typeof welcome_email_response_schema>

export function validate_request(body: any) {
    const validation = welcome_email_request_schema.safeParse(body)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}

export function validate_response(response: any) {
    const validation = welcome_email_response_schema.safeParse(response)

    if (!validation.success) {
        throw new Error(validation.error.message)
    }

    return validation.data
}
