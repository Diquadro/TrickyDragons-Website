export const API_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://api.trickydragons.com'
        : process.env.NODE_ENV === 'stage'
          ? 'https://dev-trickydragons-server.onrender.com'
          : 'http://localhost:5000'
