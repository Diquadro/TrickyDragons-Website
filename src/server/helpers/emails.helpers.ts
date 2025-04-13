import Contacts from '@schemas/public/Contacts'
import { z } from 'zod'

export class Emails_Helpers {
    static validate_input_send_welcome(contacts: Contacts[]) {
        return z
            .array(
                z
                    .object({
                        uuid: z.string().uuid(),
                        email: z.string().email({ message: 'Email not valid' }),
                    })
                    .passthrough(),
            )
            .nonempty({
                message: 'You must pass at least one contact',
            })
            .safeParse(contacts)
    }
}
