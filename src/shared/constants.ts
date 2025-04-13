if (!process.env.NODE_ENV) throw new Error('NODE_ENV not defined')

export const EMAIL_STRING = 'email'

export const IS_PROD = process.env.NODE_ENV === 'prod'
export const IS_STAGE = process.env.NODE_ENV === 'stage'
export const IS_DEV = process.env.NODE_ENV === 'dev'
export const IS_LOCAL = process.env.NODE_ENV === 'local'

const clients_url: Record<string, string> = {
    prod: 'https://www.trickydragons.com',
    dev: 'https://dev-trickydragons-www.onrender.com',
    local: 'http://localhost:5500',
}

export const CLIENT_URL = clients_url[process.env.NODE_ENV]

const apis_url: Record<string, string> = {
    prod: 'https://api.trickydragons.com',
    dev: 'https://dev-trickydragons-server.onrender.com',
    local: '', //'http://localhost:5000',
}

export const API_URL = apis_url[process.env.NODE_ENV]
