import EventOutcome from '@schemas/public/EventOutcome'
import { custom_error, VALIDATION_ERROR } from '@server_utils/custom_errors'
import { sql } from '@server_models/models'

/**
 * Base structure of a single event input
 */
export type event_base_input = {
    action?: string
    origin?: string
    outcome?: EventOutcome
    details?: string
    occurred_at?: Date
    contact_uuid?: any
    address_uuid?: any
}

/**
 * Full structure of an event record for DB
 */
export type event_record = Partial<event_base_input>

/**
 * Batch input structure for specific fields that can be arrays
 */
export type event_batch_input = {
    [K in keyof event_base_input]?: Array<event_base_input[K]>
}

/**
 * Service class to handle event operations
 */
export class Events_Services {
    base_event: event_base_input = {}
    batch_data: event_batch_input = {}

    constructor(base_event: event_base_input = {}, batch_data: event_batch_input = {}) {
        this.base_event = base_event
        this.batch_data = batch_data
    }

    /**
     * Crea un evento singolo o un batch di eventi
     * @param batch_data Dati di batch opzionali. Se specificati, verranno combinati con base_event
     */
    async create(): Promise<any> {
        try {
            // Caso 1: Nessun batch_data, crea un singolo evento
            if (!this.batch_data || Object.keys(this.batch_data).length === 0) {
                return await sql.insert('events', [this.base_event])
            }

            // Caso 2: Batch_data specificato, crea eventi multipli
            const records = this.prepare_batch()

            return await sql.insert('events', records)
        } catch (error) {
            console.error('ERROR DURING LOGGING!!', error)
        }
    }

    /**
     * Prepara un batch di eventi combinando base_event con batch_data
     */
    private prepare_batch(): event_record[] {
        let batch_size: number | null = null
        const records: event_record[] = []

        // Determina la dimensione del batch
        for (const key in this.batch_data) {
            const value = (this.batch_data as any)[key]
            if (!Array.isArray(value)) continue

            if (batch_size === null) {
                batch_size = value.length
            } else if (value.length !== batch_size) {
                throw custom_error(VALIDATION_ERROR, this.batch_data)
            }
        }

        if (!batch_size || batch_size === 0) {
            throw custom_error(VALIDATION_ERROR, {
                message: 'No events to prepare in batch_data',
            })
        }

        // Crea i record
        for (let i = 0; i < batch_size; i++) {
            const record = { ...this.base_event }

            for (const key in this.batch_data) {
                const typed_key = key as keyof event_base_input
                const batch_array = this.batch_data[typed_key] as any[]

                if (batch_array?.[i] !== undefined) {
                    record[typed_key] = batch_array[i]
                }
            }

            records.push(record)
        }

        return records
    }

    /**
     * API statica semplificata per creare eventi in un'unica operazione
     */
    static async create_events(base_event: event_base_input, batch_data?: event_batch_input): Promise<any> {
        const service = new Events_Services(base_event, batch_data)
        return await service.create()
    }

    static write_error_details(error: any) {
        return JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack,
            data: error.data,
            code: error.code,
        })
    }
}
