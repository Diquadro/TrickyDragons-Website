// Custom error class with additional properties
export class app_error extends Error {
    public status_code: number
    public details?: any

    constructor(message: string, status_code: number = 500, details?: any) {
        super(message)
        this.name = this.constructor.name
        this.status_code = status_code
        this.details = details
        // Capturing stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor)
    }
}

// Error for validation failures
export class validation_error extends app_error {
    constructor(message: string = 'Validation failed', details?: any) {
        super(message, 400, details)
    }
}

// Error for resource not found
export class not_found_error extends app_error {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, details)
    }
}

// Error for unauthorized access
export class unauthorized_error extends app_error {
    constructor(message: string = 'Unauthorized access', details?: any) {
        super(message, 401, details)
    }
}

// Error for conflict conditions
export class conflict_error extends app_error {
    constructor(message: string = 'Conflict with resource state', details?: any) {
        super(message, 409, details)
    }
}

// Common error types used throughout the application
export const ERROR_TYPES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DUPLICATE_RECORDS: 'DUPLICATE_RECORDS',
    RECORDS_NOT_FOUND: 'RECORDS_NOT_FOUND',
    MISSING_KEY_FIELD: 'MISSING_KEY_FIELD',
    NO_COLUMNS: 'NO_COLUMNS',
    NO_FIELDS_TO_UPDATE: 'NO_FIELDS_TO_UPDATE',
    ALREADY_ASSOCIATED: 'ALREADY_ASSOCIATED',
    INVALID_TABLE_NAME: 'INVALID_TABLE_NAME',
    RECORD_LIMIT_EXCEEDED: 'RECORD_LIMIT_EXCEEDED',
} as const

// Create a custom error with appropriate details
// @param type Error type
// @param details Additional error details
// @returns app_error instance with appropriate status code
export function create_error(type: keyof typeof ERROR_TYPES, details?: any): app_error {
    switch (type) {
        case ERROR_TYPES.VALIDATION_ERROR:
            return new validation_error('Validation failed', details)
        case ERROR_TYPES.DUPLICATE_RECORDS:
            return new conflict_error('Records already exist', details)
        case ERROR_TYPES.RECORDS_NOT_FOUND:
            return new not_found_error('Records not found', details)
        case ERROR_TYPES.ALREADY_ASSOCIATED:
            return new conflict_error('Already in requested state', details)
        case ERROR_TYPES.MISSING_KEY_FIELD:
            return new validation_error('Missing key field', details)
        case ERROR_TYPES.NO_COLUMNS:
            return new validation_error('No columns provided', details)
        case ERROR_TYPES.NO_FIELDS_TO_UPDATE:
            return new validation_error('No fields to update', details)
        case ERROR_TYPES.INVALID_TABLE_NAME:
            return new validation_error('Invalid table name', details)
        case ERROR_TYPES.RECORD_LIMIT_EXCEEDED:
            return new validation_error('Record limit exceeded', details)
        default:
            return new app_error('Internal server error', 500, details)
    }
}
