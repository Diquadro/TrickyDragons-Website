import path from 'path'
import { fileURLToPath } from 'url'
import Router from 'express-promise-router'
import 'dotenv/config'
import send_email from '../utils/send_email.js'
import base64url from 'base64-url'
import get_geo_infos from '../utils/get_geo_infos.js'
import { API_URL } from '../utils/constants.js'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

// Importa regex per validare le email - https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function email_subscription(pool) {
    const router = new Router()
    router.post('/', handle_email_subscription(pool))
    return router
}

function handle_email_subscription(pool) {
    return async (req, res) => {
        try {
            console.log('REQUEST - email_subscription')

            const email = req.body.email?.toLowerCase()
            const is_email_valid = validate(email)

            if (!is_email_valid.result) {
                return res.status(400).json({ error: is_email_valid.error })
            }

            // Retrieve IP & Geo Infos
            const ip_address = req.clientIp
            const geo_infos = get_geo_infos(ip_address)

            // Check if the email already exists in the database
            const existing_email = await get_email_status(pool, email)

            if (existing_email) {
                return handle_existing_email(res, pool, email, existing_email)
            }

            await handle_new_subscription(res, pool, email, ip_address, geo_infos)
        } catch (error) {
            console.error('email_subscription - error message :', error.message)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

function validate(email) {
    // Email required
    if (!email) {
        return { result: false, error: 'Email is required' }
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
        return { result: false, error: 'Invalid email format' }
    }

    return { result: true, error: '' }
}

async function get_email_status(pool, email) {
    try {
        const result = await pool.query('SELECT * FROM email_subscriptions WHERE LOWER(email) = LOWER($1)', [
            email,
        ])
        return result?.rows[0] || null
    } catch (error) {
        console.error('get_email_status - error message :', error.message)

        return null
    }
}

async function reactivate_subscription(pool, email) {
    const client = await pool.connect()

    try {
        await client.query(
            'UPDATE email_subscriptions SET subscribed = true WHERE LOWER(email) = LOWER($1)',
            [email],
        )
        return true
    } catch (error) {
        console.error('reactivate_subscription - error message :', error.message)

        return false
    } finally {
        client.release()
    }
}

async function save_email(pool, email, ip_address, geo_infos, notified) {
    const client = await pool.connect()

    try {
        // Insert new email  into the database
        await client.query(
            `INSERT INTO email_subscriptions (email, ip_address, country, region, city, notified, subscribed) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, ip_address, geo_infos.country, geo_infos.region, geo_infos.city, notified, true],
        )

        return true
    } catch (err) {
        console.error('save_email - error message :', err.message)

        return false
    } finally {
        client.release()
    }
}

async function handle_existing_email(res, pool, email, existing_email) {
    if (existing_email.subscribed === false) {
        const reactivated = await reactivate_subscription(pool, email)

        if (reactivated) {
            return res.status(200).json({
                status: 'reactivated',
                message: 'Subscription reactivated successfully',
            })
        }

        return res.status(500).json({ error: 'Failed to reactivate subscription' })
    }

    return res.status(409).json({
        status: 'duplicate',
        message: 'Email is already subscribed',
    })
}

async function handle_new_subscription(res, pool, email, ip_address, geo_infos) {
    const from = 'no-reply@trickydragons.com'
    const to = email
    const subject = 'Welcome to the world of Tricky Dragons – Your Adventure Awaits'
    const body_template_path = path.resolve(__dirname, '../emails/email_subscription/email_subscription.pug')
    const body__template_locals = {
        email_opened: `${API_URL}/email_opened/${base64url.encode(email)}`,
        email_deactivation: `${API_URL}/email_deactivation/${base64url.encode(email)}`,
    }

    const notified = await send_email(from, to, subject, body_template_path, body__template_locals)

    const saved = await save_email(pool, email, ip_address, geo_infos, notified)

    if (!saved) {
        return res.status(500).json({ error: 'Failed to save on database' })
    }

    return res.status(201).json({
        status: 'subscribed',
        message: 'Email subscribed successfully',
    })
}
