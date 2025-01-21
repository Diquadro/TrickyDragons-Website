import Router from 'express-promise-router'
import base64url from 'base64-url'
import get_geo_infos from '../utils/get_geo_infos.js'

const EVENT = {
    0: 'link_click',
    1: 'unsubscribe',
}

const ORIGINS = {
    0: 'website',
    1: 'email',
    2: 'instagram',
    3: 'facebook',
    4: 'x',
    5: 'boardgamegeek',
    6: 'external',
}

export default function redirect(pool) {
    const router = new Router()

    router.get('/:data_base_64', async (req, res) => {
        console.log('REQUEST - redirect')

        const { data_base_64 } = req.params

        // Decodifica l'URL
        // const decoded_data_base_64 = decodeURIComponent(data_base_64)
        // const decoded_data = base64url.decode(decoded_data_base_64)
        const decoded_data = Buffer.from(data_base_64, 'base64').toString('utf-8')
        const data = JSON.parse(decoded_data)

        console.log('Decoded data:', data)

        console.log(EVENT, EVENT[data.event], data.event)

        const is_data_valid = validate_data(data)
        if (!is_data_valid.ok) {
            console.error('Invalid data:', is_data_valid.json.error)
            return res.status(is_data_valid.status).json(is_data_valid.json)
        }

        // Retrieve IP and Geo Infos
        const ip_address = req.clientIp
        const geo_infos = get_geo_infos(ip_address)

        // Save data asynchronously
        save_event(pool, data, ip_address, geo_infos).catch((error) => {
            console.error('Error saving event to the database:', error.message)
        })

        // Redirect to the specified URL immediately
        return res.redirect(data.redirect_url)
    })

    return router
}

function validate_data(data) {
    const errors = []

    if (data.origin === undefined || ORIGINS[data.origin] === undefined) {
        errors.push('ORIGIN is missing or invalid.')
    }

    if (data.event === undefined || EVENT[data.event] === undefined) {
        errors.push('EVENT is missing or invalid.')
    }

    if (data.redirect_url === undefined) {
        errors.push('REDIRECT_URL is missing.')
    }

    return {
        ok: errors.length === 0,
        status: 400,
        json: { error: errors.join(' ') },
    }
}

async function save_event(pool, data, ip_address, geo_infos) {
    const client = await pool.connect()
    try {
        const query = `
            INSERT INTO tracking_redirects (
                origin, event, url, ip_address, country, region, city, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `
        const values = [
            ORIGINS[data.origin],
            EVENT[data.event],
            data.redirect_url,
            ip_address,
            geo_infos.country,
            geo_infos.region,
            geo_infos.city,
        ]

        await client.query(query, values)
        console.log('Event saved successfully:', data)
    } catch (error) {
        console.error('save_event - error message:', error.message)
        throw error
    } finally {
        client.release()
    }
}
