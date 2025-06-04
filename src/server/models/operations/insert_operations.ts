import postgres from 'postgres'
import { sql } from '../postgres_client'

// Inserts multiple records into a database table
// Performs a bulk insert operation with all records in a single SQL statement
//
// @param table_name The name of the table to insert records into
// @param records Array of record objects to insert
// @returns Promise resolving to the inserted records with their generated values
// @throws Error if validation fails or database operation fails
//
// @example
// const new_users = await insert_records('users', [
//   { name: 'Alice', email: 'alice@example.com' },
//   { name: 'Bob', email: 'bob@example.com' }
// ]);
export async function insert_records<T extends readonly (object | undefined)[] = any[]>(
    table_name: string,
    records: Record<string, any>[],
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

    // Collect all unique column names from records
    const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record))))

    // Check if columns were found
    if (columns.length === 0) {
        throw new Error('No columns found')
    }

    // Prepare values array for each record, using null for missing columns
    const values = records.map((record) => columns.map((col) => (col in record ? record[col] : null)))

    // Execute the query with parameterized values
    return await sql<T>`
        INSERT INTO ${sql(table_name)} (${sql(columns)})
        VALUES ${sql(values)}
        RETURNING *
    `
}
