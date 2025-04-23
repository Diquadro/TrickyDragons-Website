import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

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
