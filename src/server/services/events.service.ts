import { sql } from '@server/models/postgres_client'
import Events, { EventsInitializer } from '@shared/schemas/public/Events'

export abstract class Events_Service {
    static async create(event: EventsInitializer): Promise<Events[]> {
        return await sql.insert<Events[]>('events', [event])
    }
}
