import Router from 'express-promise-router'
import geoip from 'geoip-lite'
import nodemailer from 'nodemailer'
import 'dotenv/config'

const router = new Router()

// Importa regex per validare le email - https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function email_subscription(pool) {
    router.post('/', async (req, res) => {
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
        const ip_address = req.ip ?? req.headers['x-forwarded-for'] ?? req.connection.remoteAddress
        const geo = geoip.lookup(ip_address) ?? {}

        // Check if email is already in database
        if (!(await is_email_valid(pool, email))) {
            return res.status(409).json({ error: 'Email already exists' })
        }

        // Sends email to user
        const notified = await send_email(email)

        // Save email to database
        if (!(await save_email(pool, email, ip_address, geo, notified))) {
            res.status(500).json({ error: 'Failed to save on database' })
        }

        res.status(201).json({ message: 'Email subscribed successfully' })
    })

    return router
}

async function send_email(recipient) {
    try {
        // email transporter configuration
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.G_API_CLIENTE_ID,
                clientSecret: process.env.G_API_CLIENT_SECRET,
                refreshToken: process.env.G_API_REFRESH_TOKEN,
            },
        })

        // email options
        let mailOptions = {
            from: 'no-reply@trickydragons.com',
            to: recipient,
            subject: 'Mail Subscription Confirmation - [NO REPLY]',
            text: 'Thank you for subscribing!',
        }

        // send email
        await transporter.sendMail(mailOptions)

        return true
    } catch (err) {
        console.error('send_email - error message\n', err.message)

        return false
    }
}

async function is_email_valid(pool, email) {
    try {
        const existing = await pool.query(
            'SELECT * FROM email_subscriptions WHERE LOWER(email) = LOWER($1)',
            [email],
        )

        return existing.rows.length === 0
    } catch (error) {
        console.error('is_email_valid - error message\n', err.message)

        return false
    }
}

async function save_email(pool, email, ip_address, geo, notified) {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Insert new email  into the database
        await client.query(
            `INSERT INTO email_subscriptions (email, ip_address, country, region, city, postal_code, notified) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, ip_address, geo.country, geo.region, geo.city, geo.postal, notified],
        )

        await client.query('COMMIT')

        return true
    } catch (err) {
        await client.query('ROLLBACK')

        console.error('save_email - error message\n', err.message)
        return false
    } finally {
        client.release()
    }
}
