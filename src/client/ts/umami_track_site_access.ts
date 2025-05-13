import { get_utm_params } from '@client/ts/get_utm_params'
import { umami_track } from './umami_track'

window.addEventListener('DOMContentLoaded', () => {
    umami_track('site_access', {
        ...get_utm_params(),
    })
})
