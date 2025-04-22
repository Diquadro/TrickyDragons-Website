import postgres, { RowList, Sql } from 'postgres'
import { IS_PROD } from '@shared/constants'
import {
    custom_error,
    DUPLICATE_RECORDS,
    INVALID_TABLE_NAME,
    MISSING_KEY_FIELD,
    NO_COLUMNS,
    NO_FIELDS_TO_UPDATE,
    NO_RECORDS_PROVIDED,
    RECORD_LIMIT_EXCEEDED,
    RECORDS_NOT_FOUND,
    VALIDATION_ERROR,
} from '../utils/custom_errors'

// Estende l'interfaccia Sql con i metodi personalizzati
type Sql_Extended = Sql & {
    join: (xs: any[], joiner: any) => any[]
    insert: <T extends readonly (object | undefined)[] = any[]>(
        table_name: string,
        records: Record<string, any>[],
    ) => Promise<postgres.RowList<T>>
    update: <T extends readonly (object | undefined)[] = any[]>(
        table_name: string,
        records: Record<string, any>[],
        key?: string,
    ) => Promise<postgres.RowList<T>>
    // upsert: <T extends readonly (object | undefined)[] = any[]>(
    //     table_name: string,
    //     records: Record<string, any>[],
    //     key?: string,
    // ) => Promise<postgres.RowList<T>>
    delete: <T extends readonly (object | undefined)[] = any[]>(
        table_name: string,
        records: Record<string, any>[],
        key?: string,
    ) => Promise<postgres.RowList<T>>
    MAX_RECORDS_LIMIT: number
}

if (!process.env.PG_URI) throw custom_error(VALIDATION_ERROR)

// Crea e configura l'istanza di postgres
export const sql = postgres(process.env.PG_URI, {
    ssl: 'prefer',
    idle_timeout: 30,
    transform: {
        undefined: null,
    },
    // debug: !IS_PROD
    //     ? (connection, sql, params) => {
    //           console.log('[CONNECTION]', connection)
    //           console.log('[SQL]', sql)
    //           console.log('[PARAMS]', params)
    //       }
    //     : undefined,
}) as Sql_Extended

// Configurazione
sql.MAX_RECORDS_LIMIT = 500

// Metodi di utilità
sql.join = (xs, joiner) => xs.flatMap((x, i) => (i ? [joiner, x] : x))

/**
 * Inserts multiple records into a database table
 * Performs a bulk insert operation with all records in a single SQL statement
 *
 * @param table_name - The name of the table to insert records into
 * @param records - Array of record objects to insert
 * @returns Promise resolving to the inserted records with their generated values
 * @throws Error if validation fails or database operation fails
 *
 * @example
 * const newUsers = await sql.insert('users', [
 *   { name: 'Alice', email: 'alice@example.com' },
 *   { name: 'Bob', email: 'bob@example.com' }
 * ]);
 */
sql.insert = async function <T extends readonly (object | undefined)[] = any[]>(
    table_name: string,
    records: Record<string, any>[],
): Promise<postgres.RowList<T>> {
    // Guard: invalid table name
    if (typeof table_name !== 'string' || table_name.trim() === '') {
        throw custom_error(INVALID_TABLE_NAME)
    }

    // Guard: invalid or empty records array
    if (!Array.isArray(records) || records.length === 0) {
        return [] as unknown as postgres.RowList<T>
    }

    // Guard: record limit exceeded
    if (records.length > sql.MAX_RECORDS_LIMIT) {
        throw custom_error(RECORD_LIMIT_EXCEEDED, {
            limit: sql.MAX_RECORDS_LIMIT,
            received: records.length,
        })
    }

    // Collect all unique column names from records
    const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record))))

    // Check if columns were found
    if (columns.length === 0) {
        throw custom_error(NO_COLUMNS, records)
    }

    // Prepare values array for each record, using null for missing columns
    const values = records.map((record) => columns.map((col) => (col in record ? record[col] : null)))

    // Execute the query with parameterized values
    return await this<T>`
        INSERT INTO ${this(table_name)} (${this(columns)})
        VALUES ${this(values)}
        RETURNING *
    `
}

/**
 * Updates multiple records in a database table
 * Uses CASE expressions for efficient bulk updates
 *
 * @param table_name - The name of the table to update
 * @param records - Array of record objects to update, each must contain the key field
 * @param key - Name of the field to use as the unique identifier (defaults to 'uuid')
 * @returns Promise resolving to an array of updated records
 * @throws Error if validation fails or database operation fails
 *
 * @example
 * const updatedUsers = await sql.update('users', [
 *   { uuid: '123', name: 'Alice Updated' },
 *   { uuid: '456', email: 'bob.new@example.com' }
 * ]);
 */
sql.update = async function <T extends readonly (object | undefined)[] = any[]>(
    table_name: string,
    records: Record<string, any>[],
    key: string = 'uuid',
): Promise<postgres.RowList<T>> {
    // Guard: invalid table name
    if (typeof table_name !== 'string' || table_name.trim() === '') {
        throw custom_error(INVALID_TABLE_NAME)
    }

    // Guard: invalid or empty records array
    if (!Array.isArray(records) || records.length === 0) {
        return [] as unknown as postgres.RowList<T>
    }

    // Guard: record limit exceeded
    if (records.length > sql.MAX_RECORDS_LIMIT) {
        throw custom_error(RECORD_LIMIT_EXCEEDED, {
            limit: sql.MAX_RECORDS_LIMIT,
            received: records.length,
        })
    }

    // Validate key field presence
    const records_missing_key = records.filter((record) => !(key in record))
    if (records_missing_key.length > 0) {
        throw custom_error(MISSING_KEY_FIELD, {
            key: key,
            records_missing_key: records_missing_key,
        })
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
        throw custom_error(DUPLICATE_RECORDS, duplicate_records)
    }

    // Collect all unique columns that need updating (excluding the key)
    const all_columns = new Set<string>()
    records.forEach((record) => {
        Object.keys(record).forEach((col) => {
            if (col !== key) all_columns.add(col)
        })
    })

    if (all_columns.size === 0) {
        throw custom_error(NO_FIELDS_TO_UPDATE)
    }

    // Extract key values for the WHERE ... IN clause
    const key_value_list = records.map((record) => record[key])

    // Preliminary check: Verify that all provided keys exist in the DB
    const existingRecords = await this`
        SELECT ${this(key)}
        FROM ${this(table_name)}
        WHERE ${this(key)} IN ${this(key_value_list)}
    `

    if (existingRecords.length < records.length) {
        // Identify which records are missing
        const existing_keys = existingRecords.map((row: { [x: string]: any }) => row[key])
        const missing_records = records.filter((r) => !existing_keys.includes(r[key]))
        throw custom_error(RECORDS_NOT_FOUND, missing_records)
    }

    // Build dynamic update statements for each column
    const updates = Array.from(all_columns)
        .map((column) => {
            // For each column, build a CASE expression that selectively updates only
            // for records where that column was specified
            const case_fragments = records
                .filter((record) => column in record)
                .map((record) => this`WHEN ${this(key)} = ${record[key]} THEN ${record[column]}`)

            // Skip columns that don't appear in any records
            if (case_fragments.length === 0) return null

            // Build the complete CASE expression
            return this`${this(column)} = CASE ${case_fragments.reduce(
                (acc, curr) => this`${acc} ${curr}`,
            )} ELSE ${this(column)} END`
        })
        .filter(Boolean) // Remove null entries
        .reduce((acc, curr, index) => (index === 0 ? curr : this`${acc}, ${curr}`))

    // Execute the update with all CASE expressions
    return await this<T>`
        UPDATE ${this(table_name)}
        SET ${updates}
        WHERE ${this(key)} IN ${this(key_value_list)}
        RETURNING *
    `
}

// /**
//  * Performs a bulk upsert (insert or update) operation on the specified table.
//  * Inserts new records and updates existing ones based on a unique key.
//  *
//  * @param table_name - The name of the table to upsert records into.
//  * @param records - An array of record objects to upsert.
//  * @param key - The field name to use as the unique identifier (defaults to 'uuid').
//  * @returns A promise resolving to the upserted records.
//  */
// sql.upsert = async function <T extends readonly (object | undefined)[] = any[]>(
//     table_name: string,
//     records: Record<string, any>[],
//     key: string = 'uuid',
// ): Promise<postgres.RowList<T>> {
//     // Validate the table name and records array
//     validate_table_and_records(this, table_name, records)

//     // collect all distinct column names across all records
//     const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record))))

//     // guard: must have at least one column
//     if (columns.length === 0) {
//         throw custom_error(NO_COLUMNS, records)
//     }

//     // prepare a 2D array of values, using null for any missing field
//     const values = records.map((record) => columns.map((col) => (col in record ? record[col] : null)))

//     // pick which columns to update on conflict (exclude the key)
//     const update_columns = columns.filter((col) => col !== key)

//     // guard: require at least one non‐key column to update
//     if (update_columns.length === 0) {
//         throw custom_error(NO_FIELDS_TO_UPDATE)
//     }

//     // build dynamic CASE expressions so we only update fields actually provided
//     const update_sets = update_columns
//         .map((column) => {
//             // For each column, build a CASE expression that selectively updates only
//             // for records where that column was specified
//             const case_fragments = records
//                 .filter((record) => column in record)
//                 .map(
//                     (record) =>
//                         this`WHEN ${this(table_name)}.${this(key)} = ${record[key]} THEN ${record[column]}`,
//                 )

//             // Skip columns that don't appear in any records
//             if (case_fragments.length === 0) return null

//             // Build the complete CASE expression
//             return this`${this(column)} = CASE ${case_fragments.reduce(
//                 (acc, curr) => this`${acc} ${curr}`,
//             )} ELSE ${this(table_name)}.${this(column)} END`
//         })
//         .filter(Boolean) // Remove null entries
//         .reduce((acc, curr, index) => (index === 0 ? curr : this`${acc}, ${curr}`))

//     // execute the upsert: insert new rows or update existing ones on key conflict
//     return await this<T>`
//         INSERT INTO ${this(table_name)} (${this(columns)})
//         VALUES ${this(values)}
//         ON CONFLICT (${this(key)})
//         DO UPDATE SET ${update_sets}
//         RETURNING *
//     `
// }

/**
 * Deletes multiple records from a database table based on a specified key field.
 *
 * @param table_name - The name of the table to delete records from
 * @param records - Array of objects containing the key field
 * @param key - Name of the field to use as the unique identifier (defaults to 'uuid')
 * @returns Promise resolving to the deleted records
 * @throws Error if validation fails or database operation fails
 *
 * @example
 * Delete by passing an array of objects containing the key
 * const deleted_users = await sql.delete('users', [
 *   { uuid: '123' },
 *   { uuid: '456' }
 * ])
 */
sql.delete = async function <T extends readonly (object | undefined)[] = any[]>(
    table_name: string,
    records: Record<string, any>[],
    key: string = 'uuid',
): Promise<postgres.RowList<T>> {
    // Guard: invalid table name
    if (typeof table_name !== 'string' || table_name.trim() === '') {
        throw custom_error(INVALID_TABLE_NAME)
    }

    // Guard: invalid or empty records array
    if (!Array.isArray(records) || records.length === 0) {
        return [] as unknown as postgres.RowList<T>
    }

    // Guard: record limit exceeded
    if (records.length > sql.MAX_RECORDS_LIMIT) {
        throw custom_error(RECORD_LIMIT_EXCEEDED, {
            limit: sql.MAX_RECORDS_LIMIT,
            received: records.length,
        })
    }

    // Guard: missing key field in some records
    const records_missing_key = records.filter((record) => !(key in record))
    if (records_missing_key.length > 0) {
        throw custom_error(MISSING_KEY_FIELD, {
            key: key,
            records_missing_key: records_missing_key,
        })
    }

    // Extract key values for the WHERE ... IN clause
    const key_values = records.map((record) => record[key])

    // Perform the DELETE operation
    return await this<T>`
        DELETE FROM ${this(table_name)}
        WHERE ${this(key)} IN ${this(key_values)}
        RETURNING *
    `
}
