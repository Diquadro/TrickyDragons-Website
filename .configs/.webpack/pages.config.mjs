// pages.config.mjs
import dotenv from 'dotenv'
dotenv.config({ path: ['/etc/secrets/.env', '.env'] })

// Import per-page config factories (snake_case, folder-name.config.mjs)
import landingpage_config from '../../src/client/pages/landingpage/landingpage.config.mjs'
import thank_you_config from '../../src/client/pages/thank-you/thank-you.config.mjs'
import thank_you_1_dollar_config from '../../src/client/pages/thank-you-1-dollar/thank-you-1-dollar.config.mjs'
import welcome_back_config from '../../src/client/pages/welcome-back/welcome-back.config.mjs'
import not_found_config from '../../src/client/pages/404/404.config.mjs'
import checkout_config from '../../src/client/pages/checkout/checkout.config.mjs'
import reservation_config from '../../src/client/pages/reservation/reservation.config.mjs'
import unsubscribed_config from '../../src/client/pages/unsubscribed/unsubscribed.config.mjs'

const BASE_URL = 'https://www.trickydragons.com'
const env = process.env.APP_ENV

export default [
    // Landing page
    landingpage_config({ env, BASE_URL }),
    // 404
    not_found_config({ env, BASE_URL }),
    // Checkout
    checkout_config({ env, BASE_URL }),
    // Thank you page
    thank_you_config({ env, BASE_URL }),
    // Reservation
    reservation_config({ env, BASE_URL }),
    // Thank you $1 page
    thank_you_1_dollar_config({ env, BASE_URL }),
    // Welcome back page (new)
    welcome_back_config({ env, BASE_URL }),
    // Unsubscribed page
    unsubscribed_config({ env, BASE_URL }),
]
