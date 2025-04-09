import express from 'express'
import 'dotenv/config'
import { apply_middlewares } from '@api_middlewares/middlewares'
import { apply_routes } from '@api_routes/routes'
import { sql } from '@api_models/models'

const app = express()

apply_middlewares(app)
apply_routes(app)

// Graceful Shutdown to close database connections
process.on('SIGINT', async () => {
    await sql.end()
    console.log('Database pool closed.')

    process.exit()
})

// Start the server
const port = parseInt(process.env.SERVER_PORT)
app.listen(port, () => console.log(`Server running on port ${port}`))
