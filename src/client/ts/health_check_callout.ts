import { API, ENV } from '@shared/constants/app.constants'

window.addEventListener('DOMContentLoaded', () => {
    const endpoint = ENV.LOCAL ? `${API.ENDPOINTS.HEALTH}` : `${API.URL}${API.ENDPOINTS.HEALTH}`
    fetch(endpoint).catch((_) => {})
})
