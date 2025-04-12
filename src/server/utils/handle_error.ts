import { Response } from 'express'
import { IS_PROD } from '@shared/constants'

export function handle_error(res: Response, error: any): Response {
    return res
        .status(typeof error.code === 'number' && error.code >= 100 && error.code < 600 ? error.code : 500)
        .json({
            label: error.label,
            message: error.message,
            ...(!IS_PROD && error.data && { data: error.data }),
            ...(!IS_PROD && error.stack && { stack: error.stack }),
        })
}
