import { IS_PROD } from '@shared/constants'
import morgan from 'morgan'

const format = IS_PROD ? 'combined' : 'dev'
export const morgan_middleware = morgan(format)
