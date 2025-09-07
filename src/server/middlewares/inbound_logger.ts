import { Request, Response, NextFunction } from 'express'
import { sql } from '@server/models/postgres_client'

interface InboundLogData {
    method: string
    url: string
    headers: object
    query_params: object
    body: object | null
    ip_address: string | null
    user_agent: string | null
}

/**
 * Middleware per loggare tutte le chiamate in entrata nel database
 * Salva la richiesta in modo asincrono senza bloccare la risposta
 */
export const inbound_logger = (req: Request, res: Response, next: NextFunction) => {
    // Continua subito con la richiesta
    next()

    if (req.path.includes('analytics-events')) return

    // Salva la richiesta in modo asincrono (fire and forget)
    save_inbound_request(req).catch((error) => {
        console.error('Failed to log inbound request:', error)
    })
}

/**
 * Salva la richiesta nel database in modo asincrono
 */
async function save_inbound_request(req: Request): Promise<void> {
    const log_data: InboundLogData = {
        method: req.method,
        url: req.originalUrl || req.url,
        headers: sanitize_headers(req.headers),
        query_params: req.query || {},
        body: sanitize_body(req.body),
        ip_address: extract_ip_address(req),
        user_agent: req.get('User-Agent') || null,
    }

    await sql.insert('inbound_logs', [log_data])
}

/**
 * Rimuove headers sensibili per sicurezza
 */
function sanitize_headers(headers: any): object {
    const sensitive_headers = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']

    const sanitized = { ...headers }

    sensitive_headers.forEach((header) => {
        if (sanitized[header]) {
            sanitized[header] = '[REDACTED]'
        }
    })

    return sanitized
}

/**
 * Sanitizza il body per evitare di salvare dati sensibili
 */
function sanitize_body(body: any): object | null {
    if (!body || typeof body !== 'object') {
        return body
    }

    const sensitive_fields = ['password', 'token', 'secret', 'card_number', 'cvv']

    const sanitized = { ...body }

    sensitive_fields.forEach((field) => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]'
        }
    })

    return sanitized
}

/**
 * Estrae l'IP address dalla richiesta
 * Compatibile con proxy e load balancer
 */
function extract_ip_address(req: Request): string | null {
    const forwarded = req.get('X-Forwarded-For')
    const real_ip = req.get('X-Real-IP')
    const remote_addr = req.connection?.remoteAddress || req.socket?.remoteAddress

    return forwarded?.split(',')[0]?.trim() || real_ip || remote_addr || null
}
