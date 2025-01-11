import Router from 'express-promise-router'
import geoip from 'geoip-lite'
import { isbot } from 'isbot'
import base64url from 'base64-url'

const router = new Router()

export default function email_opened(pool) {
    router.get('/:id', async (req, res) => {
        console.log('REQUEST - email_opened')

        res.setHeader('Content-Type', 'image/gif')
        res.send(Buffer.alloc(1)) // Immagine GIF vuota

        if (isbot(req.get('user-agent'))) {
            return
        }

        const { id } = req.params
        const email = base64url.decode(id)

        update_opened_mail(pool, email)
    })

    return router
}

async function update_opened_mail(pool, email) {
    const client = await pool.connect()

    try {
        const result = await client.query(
            'UPDATE email_subscriptions SET opened = TRUE WHERE email = $1 RETURNING *',
            [email],
        )

        return result.rowCount > 0
    } catch (err) {
        console.error('update_opened_mail - error message : ', err.message)

        return false
    } finally {
        client.release()
    }
}
