import { initialize_umami } from '@client/ts/umami'
import { initialize_meta_pixel } from '@client/ts/cookie_meta_pixel'
import { initialize_analytics } from '@client/ts/analytics_events'
import { initialize_screen_infos } from '@client/ts/screen_infos'
import { initialize_utm_params } from '@client/ts/utm_params'
import { initialize_posthog } from '@client/ts/posthog'

initialize_meta_pixel()
initialize_utm_params()
initialize_screen_infos()
initialize_analytics()
initialize_posthog()
initialize_umami()
