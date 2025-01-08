import express from 'express'
import 'dotenv/config'
import pg from 'pg'
import site_accesses from './routes/site_accesses.js'
import email_subscription from './routes/email_subscription.js'

const { Pool } = pg
const app = express()
const port = process.env.SERVER_PORT ?? 5000

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.PGURI,
    ssl: { rejectUnauthorized: false },
})

// Middleware for parsing JSON requests
app.use(express.json())

// Routes
app.use('/email-subscription', email_subscription(pool))
app.use('/site-accesses', site_accesses(pool))

// Graceful Shutdown to close database connections
process.on('SIGINT', async () => {
    await pool.end()
    console.log('Database pool closed.')

    process.exit()
})

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`))
