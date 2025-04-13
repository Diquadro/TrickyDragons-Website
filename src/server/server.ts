import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

import express from 'express'
import { apply_middlewares } from '@server_middlewares/middlewares'
import { apply_routes } from '@server_routes/routes'
import { sql } from '@server_models/models'

const app = express()

apply_middlewares(app)
apply_routes(app)

const c = __dirname

// Graceful Shutdown to close database connections
process.on('SIGINT', async () => {
    await sql.end()
    console.log('Database pool closed.')

    process.exit()
})

// Start the server
if (!process.env.SERVER_PORT) throw new Error('Missing SERVER_PORT')
const port = parseInt(process.env.SERVER_PORT)
app.listen(port, () => console.log(`Server running on port ${port}`))
