import Router from 'express-promise-router'
import { isbot } from 'isbot'
import get_geo_infos from '../utils/get_geo_infos.js'

const router = new Router()

export default function site_accesses(pool) {
    router.post('/', async (req, res) => {
        console.log('REQUEST - site_access')

        const ip_address = req.clientIp

        if (isbot(req.get('user-agent')) || ['::1', '::ffff:127.0.0.1'].includes(ip_address)) {
            return res.status(204).json({ error: 'Bot detected. Access skipped.' })
        }

        const geo_infos = get_geo_infos(ip_address)
        const today = new Date().toISOString().split('T')[0]

        if (!save_access(pool, ip_address, geo_infos, today)) {
            return res.status(500).json({ error: err.message })
        }

        return res.status(200).json({ message: 'Access logged successfully' })
    })

    return router
}

async function save_access(pool, ip_address, geo_infos, today) {
    const client = await pool.connect()

    try {
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
                `INSERT INTO site_accesses (ip_address, country, region, city, last_accessed) 
                    VALUES ($1, $2, $3, $4, $5)`,
                [ip_address, geo_infos.country, geo_infos.region, geo_infos.city, today],
            )
        }

        return true
    } catch (err) {
        console.error('site_accesses - error message : ', err.message)

        return false
    } finally {
        client.release()
    }
}
