import Router from 'express-promise-router'
import geoip from 'geoip-lite'
import { isbot } from 'isbot'

const router = new Router()

export default function site_accesses(pool) {
    router.post('/', async (req, res) => {
        console.log('REQUEST - site_accesses')

        if (isbot(req.get('user-agent'))) {
            return res.status(403).json({ error: 'Bot detected. Access skipped.' })
        }

        // Retrieve IP Address & Geo Infos
        const ip_address = req.ip ?? req.headers['x-forwarded-for'] ?? req.connection.remoteAddress
        const geo = geoip.lookup(ip_address) ?? {}
        const today = new Date().toISOString().split('T')[0]

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            // Check if the IP has accessed the site today
            const existing = await client.query(
                'SELECT * FROM site_accesses WHERE ip_address = $1 AND last_accessed = $2',
                [ip_address, today],
            )

            if (existing.rows.length > 0) {
                // Increment visit count if access exists for today
                await client.query('UPDATE site_accesses SET visit_count = visit_count + 1 WHERE id = $1', [
                    existing.rows[0].id,
                ])
            } else {
                // Insert a new entry for today's access
                await client.query(
                    `INSERT INTO site_accesses (ip_address, country, region, city, postal_code, last_accessed) 
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [ip_address, geo.country, geo.region, geo.city, geo.postal, today],
                )
            }

            await client.query('COMMIT')
            res.status(200).json({ message: 'Access logged successfully' })
        } catch (err) {
            await client.query('ROLLBACK')
            res.status(500).json({ error: err.message })
        } finally {
            client.release()
        }
    })

    return router
}
