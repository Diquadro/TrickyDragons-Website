import site_accesses from '../../scripts/api/site_accesses'
import cta from './scripts/cta'
import cta_modal from './scripts/cta_modal'

console.log('Welcome to the Tricky Dragons™ World')

const API_URL =
    process.env.NODE_ENV === 'production' ? 'https://api.trickydragons.com' : 'http://localhost:5000'

site_accesses(API_URL)
cta(API_URL)
cta_modal()
