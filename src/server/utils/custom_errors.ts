//                                    CODE  LABEL                     MESSAGE
export const VALIDATION_ERROR       = [400, 'VALIDATION_ERROR',       'Invalid input provided'] as const
export const DUPLICATE_RECORDS      = [409, 'DUPLICATE_RECORDS',      'Duplicate values found in the database'] as const
export const ALREADY_ASSOCIATED     = [409, 'ALREADY_ASSOCIATED',     'Some records already have the requested association'] as const
export const RECORDS_NOT_FOUND      = [404, 'RECORDS_NOT_FOUND',      'Some records were not found in the database'] as const
export const RECORD_LIMIT_EXCEEDED  = [413, 'RECORD_LIMIT_EXCEEDED',  'Too many records.'] as const;
export const NO_RECORDS_PROVIDED    = [400, 'NO_RECORDS_PROVIDED',    'No records were provided.'] as const;
export const INVALID_TABLE_NAME     = [400, 'INVALID_TABLE_NAME',     'Invalid or missing table name.'] as const;
export const NO_COLUMNS             = [400, 'NO_COLUMNS',             'No columns found in records.'] as const;
export const MISSING_KEY_FIELD      = [413, 'MISSING_KEY_FIELD',      'Each record must include the key.'] as const;
export const NO_FIELDS_TO_UPDATE    = [413, 'NO_FIELDS_TO_UPDATE',    'No fields to update found in records.'] as const;


type Custom_Error = {
    code: number
    label: string
    message: string
    data?: any
}

export function custom_error([code, label, message]: readonly [number, string, string], data?: any): Custom_Error {
    return data ? { code, label, message, data } : { code, label, message }
}