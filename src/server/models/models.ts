import postgres, { Sql } from 'postgres'
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
    insert: (table_name: string, records: Record<string, any>[]) => Promise<any[]>
    update: (table_name: string, records: Record<string, any>[], key?: string) => Promise<any[]>
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
    debug: !IS_PROD
        ? (connection, sql, params) => {
              console.log('[CONNECTION]', connection)
              console.log('[SQL]', sql)
              console.log('[PARAMS]', params)
          }
        : undefined,
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
sql.insert = async function (table_name: string, records: Record<string, any>[]) {
    // Validate inputs
    validateTableAndRecords(this, table_name, records)

    // Collect all unique column names from records
    const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record))))

    // Check if columns were found
    if (columns.length === 0) {
        throw custom_error(NO_COLUMNS, records)
    }

    // Prepare values array for each record, using null for missing columns
    const values = records.map((record) => columns.map((col) => (col in record ? record[col] : null)))

    // Execute the query with parameterized values
    return this`
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
sql.update = async function (table_name: string, records: Record<string, any>[], key: string = 'uuid') {
    // Validate inputs
    validateTableAndRecords(this, table_name, records)

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

    // Perform update in a transaction
    return await this.begin(async (tx: Sql) => {
        // Build dynamic update statements for each column
        const updates = Array.from(all_columns)
            .map((column) => {
                // For each column, build a CASE expression that selectively updates only
                // for records where that column was specified
                const case_fragments = records
                    .filter((record) => column in record)
                    .map((record) => tx`WHEN ${tx(key)} = ${record[key]} THEN ${record[column]}`)

                // Skip columns that don't appear in any records
                if (case_fragments.length === 0) return null

                // Build the complete CASE expression
                return tx`${tx(column)} = CASE ${case_fragments.reduce(
                    (acc, curr) => tx`${acc} ${curr}`,
                )} ELSE ${tx(column)} END`
            })
            .filter(Boolean) // Remove null entries
            .reduce((acc, curr, index) => (index === 0 ? curr : tx`${acc}, ${curr}`))

        // Execute the update with all CASE expressions
        return await tx`
            UPDATE ${tx(table_name)}
            SET ${updates}
            WHERE ${tx(key)} IN ${tx(key_value_list)}
            RETURNING *
        `
    })
}

// Funzioni di validazione comuni
function validateTableAndRecords(sql: Sql_Extended, table_name: string, records: Record<string, any>[]) {
    if (!table_name) {
        throw custom_error(INVALID_TABLE_NAME)
    }

    if (!Array.isArray(records) || records.length === 0) {
        throw custom_error(NO_RECORDS_PROVIDED)
    }

    if (records.length > sql.MAX_RECORDS_LIMIT) {
        throw custom_error(RECORD_LIMIT_EXCEEDED, {
            limit: sql.MAX_RECORDS_LIMIT,
            received: records.length,
        })
    }
}
