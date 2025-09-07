import { Request, Response } from 'express'
import { sql } from '@server/models/postgres_client'
import { HTTP_STATUS } from '@shared/constants/app.constants'

/**
 * Restituisce i dati delle tabelle per l'admin dashboard
 */
export async function getTableData(req: Request, res: Response): Promise<void> {
    try {
        const { tableName } = req.params

        let query = ''

        switch (tableName) {
            case 'contacts':
                query = `
                    SELECT 
                        auto_serial,
                        email,
                        first_name,
                        last_name,
                        status,
                        subscriptions,
                        created_date,
                        sent_emails
                    FROM contacts 
                    ORDER BY created_date DESC 
                    LIMIT 1000
                `
                break

            case 'orders':
                query = `
                    SELECT 
                        auto_serial,
                        email,
                        amount_total,
                        currency,
                        status,
                        stripe_session_id,
                        occurred_at,
                        billing_name,
                        billing_country
                    FROM orders 
                    ORDER BY occurred_at DESC 
                    LIMIT 1000
                `
                break

            case 'analytics':
                query = `
                    SELECT 
                        uuid,
                        event_name,
                        page_url,
                        utm_source,
                        utm_campaign,
                        country,
                        occurred_at,
                        session_id
                    FROM analytics_events 
                    ORDER BY occurred_at DESC 
                    LIMIT 1000
                `
                break

            default:
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: `Tabella non supportata: ${tableName}`,
                })
                return
        }

        const results = await sql.unsafe(query)

        res.json({
            success: true,
            data: results,
            count: results.length,
        })
    } catch (error) {
        console.error('Errore API getTableData:', error)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Errore interno del server',
        })
    }
}

/**
 * Restituisce il conteggio dei record per ogni tabella
 */
export async function getTableCounts(req: Request, res: Response): Promise<void> {
    try {
        const queries = [
            sql`SELECT COUNT(*) as count FROM contacts`,
            sql`SELECT COUNT(*) as count FROM orders`,
            sql`SELECT COUNT(*) as count FROM analytics_events`,
        ]

        const [contactsResult, ordersResult, analyticsResult] = await Promise.all(queries)

        const counts = {
            contacts: parseInt(contactsResult[0].count as string),
            orders: parseInt(ordersResult[0].count as string),
            analytics: parseInt(analyticsResult[0].count as string),
        }

        res.json({
            success: true,
            counts,
        })
    } catch (error) {
        console.error('Errore API getTableCounts:', error)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Errore interno del server',
        })
    }
}
