import postgres from 'postgres'
import Addresses from '@shared/schemas/public/Addresses'

declare module 'postgres' {
    interface Sql {
        MAX_RECORDS_LIMIT: number
        join: (xs: any[], joiner: any) => any[]
        insert<T extends readonly (object | undefined)[] = any[]>(
            table_name: string,
            records: Record<string, any>[],
        ): Promise<postgres.RowList<T>>
        update<T extends readonly (object | undefined)[] = any[]>(
            table_name: string,
            records: Record<string, any>[],
            key?: string,
        ): Promise<postgres.RowList<T>>
        delete<T extends readonly (object | undefined)[] = any[]>(
            table_name: string,
            records: Record<string, any>[],
            key?: string,
        ): Promise<postgres.RowList<T>>
    }
}

// Utility type to support converting Row types to schema types
declare global {
    namespace postgres {
        interface RowList<T> extends Array<T> {}
    }
}
