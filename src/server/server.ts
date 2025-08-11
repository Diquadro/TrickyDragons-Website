import 'express-async-errors'
import dotenv from 'dotenv'

// Debug: Check NODE_ENV before dotenv
console.log('🚀 SERVER STARTUP DEBUG - BEFORE DOTENV:', {
    'process.env.NODE_ENV': process.env.NODE_ENV,
    'process.argv': process.argv,
    'process.cwd()': process.cwd(),
})

dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

// Debug: Check NODE_ENV after dotenv
console.log('📁 SERVER STARTUP DEBUG - AFTER DOTENV:', {
    'process.env.NODE_ENV': process.env.NODE_ENV,
    'dotenv loaded from paths': ['/etc/secrets/.env', '.env'],
})

import express from 'express'
import { apply_middlewares } from '@server/middlewares/middlewares'
import { apply_routes } from '@server/routes'
import { sql } from '@server/models/postgres_client'
import { API } from '@shared/constants/app.constants'

// Main server initialization function
async function start_server() {
    // Create Express application
    const app = express()

    // Apply middleware
    apply_middlewares(app)

    // Apply routes
    apply_routes(app)

    // Graceful shutdown to close database connections
    process.on('SIGINT', async () => {
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
