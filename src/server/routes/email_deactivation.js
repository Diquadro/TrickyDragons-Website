import Router from 'express-promise-router'
import base64url from 'base64-url'

export default function email_deactivation(pool) {
    const router = new Router()

    router.get('/:data', async (req, res) => {
        console.log('REQUEST - email_deactivation')

        const { data } = req.params
        const email = base64url.decode(data)

        try {
            const updated = await update_server(pool, email)

            if (updated) {
                console.log(`Email ${email} unsubscribed successfully.`)
                return res.status(200).send('Successfully unsubscribed.')
            } else {
                console.warn(`Email ${email} not found or already unsubscribed.`)
                return res.status(400).send('Error: Unable to unsubscribe. Email not found.')
            }
        } catch (error) {
            console.error('Error unsubscribing email:', error.message)
            return res.status(500).send('Internal server error.')
        }
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
