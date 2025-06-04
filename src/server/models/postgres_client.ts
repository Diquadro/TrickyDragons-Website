import postgres from 'postgres'
import { DATABASE } from '@shared/constants/app.constants'
import { insert_records } from '@server/models/operations/insert_operations'
import { update_records } from '@server/models/operations/update_operations'
import { delete_records } from '@server/models/operations/delete_operations'

// Check if database connection URI is available
if (!process.env.PG_URI) {
    throw new Error('Missing PG_URI environment variable')
}

// Postgres client configuration
const sql_config = {
    ssl: 'prefer' as 'prefer',
    idle_timeout: 30,
    transform: {
        undefined: null,
    },
    debug: process.env.NODE_ENV !== 'production',
}

// Base postgres client instance
export const sql = postgres(process.env.PG_URI, sql_config)

// Set configuration limits
sql.MAX_RECORDS_LIMIT = DATABASE.MAX_RECORDS_LIMIT

// Helper to join arrays with separator
sql.join = (xs, joiner) => xs.flatMap((x, i) => (i ? [joiner, x] : x))

// Extend SQL with CRUD operations
sql.insert = insert_records
sql.update = update_records
sql.delete = delete_records
