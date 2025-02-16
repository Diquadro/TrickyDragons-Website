import 'dotenv/config'

export const EMAIL_STRING = 'email'

export const CLIENT_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://www.trickydragons.com'
        : process.env.NODE_ENV === 'stage'
          ? 'https://dev-trickydragons-www.onrender.com'
          : 'http://localhost:5500'

export const API_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://api.trickydragons.com'
        : process.env.NODE_ENV === 'stage'
          ? 'https://dev-trickydragons-server.onrender.com'
          : 'http://localhost:5000'
