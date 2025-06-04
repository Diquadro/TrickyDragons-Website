import '@client/components/cookie_consent/cookieconsent-config'
import '@client/components/umami/umami'
import '@client/ts/posthog'
import { initialize_meta_pixel } from '@client/components/cookie_meta_pixel/cookie_meta_pixel'
import { initialize_analytics } from '@client/ts/analytics_events'
import { initialize_screen_infos } from '@client/ts/screen_infos'
import { initialize_utm_params } from '@client/ts/utm_params'
import { initialize_posthog } from '@client/ts/posthog'

initialize_meta_pixel()
initialize_utm_params()
initialize_screen_infos()
initialize_analytics()
initialize_posthog()
