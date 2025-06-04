import postgres from 'postgres'
import { sql } from '../postgres_client'

// Deletes multiple records from a database table based on a specified key field.
//
// @param table_name The name of the table to delete records from
// @param records Array of objects containing the key field
// @param key Name of the field to use as the unique identifier (defaults to 'uuid')
// @returns Promise resolving to the deleted records
// @throws Error if validation fails or database operation fails
//
// @example
// Delete by passing an array of objects containing the key
// const deleted_users = await delete_records('users', [
//   { uuid: '123' },
//   { uuid: '456' }
// ])
export async function delete_records<T extends readonly (object | undefined)[] = any[]>(
    table_name: string,
    records: Record<string, any>[],
    key: string = 'uuid',
): Promise<postgres.RowList<T>> {
    // Guard: invalid table name
    if (typeof table_name !== 'string' || table_name.trim() === '') {
        throw new Error('Invalid table name')
    }

    // Guard: invalid or empty records array
    if (!Array.isArray(records) || records.length === 0) {
        return [] as unknown as postgres.RowList<T>
    }

    // Guard: record limit exceeded
    if (records.length > sql.MAX_RECORDS_LIMIT) {
        throw new Error('Record limit exceeded')
    }

    // Guard: missing key field in some records
    const records_missing_key = records.filter((record) => !(key in record))
    if (records_missing_key.length > 0) {
        throw new Error('Missing key field')
    }

    // Extract key values for the WHERE ... IN clause
    const key_values = records.map((record) => record[key])

    // Perform the DELETE operation
    return await sql<T>`
        DELETE FROM ${sql(table_name)}
        WHERE ${sql(key)} IN ${sql(key_values)}
        RETURNING *
    `
}
