import { sql } from '@server/models/postgres_client'
import Orders from '@shared/schemas/database/public/Orders'

/**
 * Check if contact has a KSE (Kickstarter Edition) reservation order
 * @param contact_uuid Contact UUID to check
 * @returns true if contact has KSE reservation order
 */
export async function check_has_kse_reservation(contact_uuid: string): Promise<boolean> {
    const orders = await sql<Orders[]>`
        SELECT line_items FROM orders 
        WHERE contact_uuid = ${contact_uuid}
        AND line_items IS NOT NULL
        AND status = 'paid'
    `

    for (const order of orders) {
        if (order.line_items && Array.isArray(order.line_items)) {
            for (const item of order.line_items as any[]) {
                if (
                    item.description &&
                    item.description.toLowerCase().includes('tricky dragons kse reservation')
                ) {
                    return true
                }
            }
        }
    }

    return false
}
