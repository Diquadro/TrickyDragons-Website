import Contacts from '@schemas/public/Contacts'
import { z } from 'zod'

export class Contacts_Helpers {
    static validate_contacts_have_email(contacts: Contacts[]) {
        return z
            .array(
                z
                    .object({
                        email: z.string().email(),
                    })
                    .passthrough(),
            )
            .nonempty({
                message: 'You must pass at least one contact',
            })
            .safeParse(contacts)
    }

    static validate_contacts_have_uuid(contacts: Contacts[]) {
        return z
            .array(
                z
                    .object({
                        uuid: z.string().uuid(),
                    })
                    .passthrough(),
            )
            .nonempty({
                message: 'You must pass at least one contact',
            })
            .safeParse(contacts)
    }
}
