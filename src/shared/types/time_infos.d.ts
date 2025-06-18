// Time information interface for Express Request extension
export interface time_infos {
    timezone: string | null
    local_occurred_at: Date | null
    utc_occurred_at: Date
}

// Extends Express Request with time information
declare global {
    namespace Express {
        interface Request {
            time_infos?: time_infos
        }
    }
}
