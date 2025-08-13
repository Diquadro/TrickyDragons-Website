import 'express-async-errors'
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import express from 'express'
import { apply_middlewares } from '@server/middlewares/middlewares'
import { apply_routes } from '@server/routes'
import { sql } from '@server/models/postgres_client'
import { API } from '@shared/constants/app.constants'
import { start_all_cron_jobs, stop_all_cron_jobs } from '@server/crons'

// Main server initialization function
async function start_server() {
    // Create Express application
    const app = express()

    // Apply middleware
    apply_middlewares(app)

    // Apply routes
    apply_routes(app)

    // Start cron jobs
    start_all_cron_jobs()

    // Graceful shutdown to close database connections
    process.on('SIGINT', async () => {
        console.log('🛑 Graceful shutdown initiated...')
        stop_all_cron_jobs()
        await sql.end()
        console.log('Database pool closed.')
        process.exit()
    })

    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM received - graceful shutdown initiated...')
        stop_all_cron_jobs()
        await sql.end()
        console.log('Database pool closed.')
        process.exit()
    })

    // Global error handlers for uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
        console.error('🚨 UNCAUGHT EXCEPTION:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            processId: process.pid,
        })
    })

    process.on('unhandledRejection', (reason, promise) => {
        console.error('🚨 UNHANDLED REJECTION:', {
            reason: reason,
            promise: promise,
            timestamp: new Date().toISOString(),
            processId: process.pid,
        })
    })

    // Get port from environment or use default
    const port = API.PORT

    // Start the server
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}

// Start the server and handle any initialization errors
start_server().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
})
