import path from 'path'
import { fileURLToPath } from 'url'
import Router from 'express-promise-router'
import geoip from 'geoip-lite'
import 'dotenv/config'
import send_email from '../utils/send_email.js'
import base64url from 'base64-url'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

const router = new Router()

// Importa regex per validare le email - https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function email_subscription(pool) {
    router.post('/', async (req, res) => {
        try {
            console.log('REQUEST - email_subscription')

            let { email } = req.body

            if (!email) {
                return res.status(400).json({ error: 'Email is required' })
            }

            email = email?.toLowerCase()

            // Validate email format
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' })
            }

            // Retrieve IP & Geo Infos
            const ip_address = req.clientIp
            const geo = geoip.lookup(ip_address) ?? {}

            // Check if email is already in database
            if (!(await is_email_valid(pool, email))) {
                return res.status(409).json({ error: 'Email already exists' })
            }

            // Sends email to user
            const from = 'no-reply@trickydragons.com'
            const to = email
            const subject = 'Welcome to the world of Tricky Dragons – Your Adventure Awaits!'
            const body_template_path = path.resolve(__dirname, '../emails/welcome_email/welcome_email.pug') //'../emails/welcome_email/welcome_email.pug'
            const body__template_locals = {
                email_opened: `https://api.trickydragons.com/email_opened/${base64url.encode(email)}`,
            }
            const notified = await send_email(from, to, subject, body_template_path, body__template_locals)

            // Save email to database
            if (!(await save_email(pool, email, ip_address, geo, notified))) {
                return res.status(500).json({ error: 'Failed to save on database' })
            }

            return res.status(201).json({ message: 'Email subscribed successfully' })
        } catch (error) {
            console.error('email_subscription - error message\n', err.message)
        }
    })

    return router
}

async function is_email_valid(pool, email) {
    try {
        const result = await pool.query('SELECT * FROM email_subscriptions WHERE LOWER(email) = LOWER($1)', [
            email,
        ])

        return result.rows.length === 0
    } catch (error) {
        console.error('is_email_valid - error message : ', err.message)

        return false
    }
}

async function save_email(pool, email, ip_address, geo, notified) {
    const client = await pool.connect()

    try {
        // Insert new email  into the database
        await client.query(
            `INSERT INTO email_subscriptions (email, ip_address, country, region, city, postal_code, notified) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, ip_address, geo.country, geo.region, geo.city, geo.postal, notified],
        )

        return true
    } catch (err) {
        console.error('save_email - error message\n', err.message)

        return false
    } finally {
        client.release()
    }
}
