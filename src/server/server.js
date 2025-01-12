import express from 'express'
import 'dotenv/config'
import pg from 'pg'
import site_access from './routes/site_access.js'
import email_subscription from './routes/email_subscription.js'
import cors from 'cors'
import email_opened from './routes/email_opened.js'
import * as request_ip from 'request-ip'
import email_deactivation from './routes/email_deactivation.js'

const { Pool } = pg
const app = express()
const port = process.env.SERVER_PORT ?? 5000

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.PGURI,
    ssl: { rejectUnauthorized: false },
})

// Middleware for ip lookup
app.use(request_ip.mw())

// Middleware for parsing JSON requests
app.use(express.json())

// Enable cors
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGIN, // Replace with your domains
        methods: ['GET', 'POST'],
    }),
)

// Routes
app.use('/email_subscription', email_subscription(pool))
app.use('/site_access', site_access(pool))
app.use('/email_opened', email_opened(pool))
app.use('/email_deactivation', email_deactivation(pool))

// Graceful Shutdown to close database connections
process.on('SIGINT', async () => {
    await pool.end()
    console.log('Database pool closed.')

    process.exit()
})

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`))
