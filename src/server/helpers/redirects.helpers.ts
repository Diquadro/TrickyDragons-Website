import { z } from 'zod'

export class Redirects_Helpers {
    static validate_data64(data64: any) {
        return z
            .object({
                origin: z.string(),
                redirect_url: z.string().url(),
            })
            .strict()
            .safeParse(data64)
    }
}
