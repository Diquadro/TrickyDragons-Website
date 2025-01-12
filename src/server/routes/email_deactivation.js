import Router from 'express-promise-router'
import base64url from 'base64-url'
import { CLIENT_URL } from '../utils/constants.js'

const router = new Router()

export default function email_deactivation(pool) {
    router.get('/:id', async (req, res) => {
        console.log('REQUEST - email_deactivation')

        const { id } = req.params
        const email = base64url.decode(id)

        if (!(await update_server(pool, email))) {
            return res.status(400).send('Error: Unable to unsubscribe. Email not found.')
        }

        return res.redirect(CLIENT_URL + '/email_deactivation')
    })

    return router
}

async function update_server(pool, email) {
    const client = await pool.connect()

    try {
        const result = await client.query(
            'UPDATE email_subscriptions SET subscribed = FALSE WHERE email = $1 AND subscribed = TRUE RETURNING *',
            [email],
        )

        return result.rowCount > 0
    } catch (err) {
        console.error('update_server - error message :', err.message)
        return false
    } finally {
        client.release()
    }
}
