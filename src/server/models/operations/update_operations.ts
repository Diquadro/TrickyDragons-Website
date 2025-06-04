import postgres from 'postgres'
import { sql } from '../postgres_client'

// Updates multiple records in a database table
// Uses CASE expressions for efficient bulk updates
//
// @param table_name The name of the table to update
// @param records Array of record objects to update, each must contain the key field
// @param key Name of the field to use as the unique identifier (defaults to 'uuid')
// @returns Promise resolving to an array of updated records
// @throws Error if validation fails or database operation fails
//
// @example
// const updated_users = await update_records('users', [
//   { uuid: '123', name: 'Alice Updated' },
//   { uuid: '456', email: 'bob.new@example.com' }
// ]);
export async function update_records<T extends readonly (object | undefined)[] = any[]>(
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

    // Validate key field presence
    const records_missing_key = records.filter((record) => !(key in record))
    if (records_missing_key.length > 0) {
        throw new Error('Missing key field')
    }

    // Find duplicate key values
    const key_values = records.map((r) => r[key])
    const key_count = key_values.reduce(
        (acc, val) => {
            acc[val] = (acc[val] || 0) + 1
            return acc
        },
        {} as Record<string, number>,
    )

    const duplicate_keys = Object.entries(key_count)
        .filter(([_, count]) => (count as number) > 1)
        .map(([key_val]) => key_val)

    if (duplicate_keys.length > 0) {
        const duplicate_records = records.filter((r) => duplicate_keys.includes(r[key]))
        throw new Error('Duplicate records')
    }

    // Collect all unique columns that need updating (excluding the key)
    const all_columns = new Set<string>()
    records.forEach((record) => {
        Object.keys(record).forEach((col) => {
            if (col !== key) all_columns.add(col)
        })
    })

    if (all_columns.size === 0) {
        throw new Error('No fields to update')
    }

    // Extract key values for the WHERE ... IN clause
    const key_value_list = records.map((record) => record[key])

    // Build dynamic update statements for each column
    const updates = Array.from(all_columns)
        .map((column) => {
            // For each column, build a CASE expression that selectively updates only
            // for records where that column was specified
            const case_fragments = records
                .filter((record) => column in record)
                .map((record) => sql`WHEN ${sql(key)} = ${record[key]} THEN ${record[column]}`)

            // Skip columns that don't appear in any records
            if (case_fragments.length === 0) return null

            // Build the complete CASE expression
            const case_statements = case_fragments.reduce((acc, curr) => sql`${acc} ${curr}`)
            return sql`${sql(column)} = CASE ${case_statements} ELSE ${sql(column)} END`
        })
        .filter(Boolean) // Remove null entries
        .reduce((acc, curr, index) => (index === 0 ? curr : sql`${acc}, ${curr}`))

    // Execute the update with all CASE expressions
    return await sql<T>`
        UPDATE ${sql(table_name)}
        SET ${updates}
        WHERE ${sql(key)} IN ${sql(key_value_list)}
        RETURNING *
    `
}
