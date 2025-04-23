import { z } from 'zod'

// Schema per il payload di redirect codificato in Base64
export const redirect_payload_schema = z.object({
    redirect_url: z.string().url(),
    origin: z.string().optional(),
    email: z.string().email().optional(),
})

// Schema per la risposta
export const redirect_response_schema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
})

// Tipi esportati
export type Redirect_Payload = z.infer<typeof redirect_payload_schema>
export type Redirect_Response = z.infer<typeof redirect_response_schema>
