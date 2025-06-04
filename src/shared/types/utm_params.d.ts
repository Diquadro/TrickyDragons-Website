// Define the UTM parameters interface
export interface utm_params {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    utm_id?: string
    utm_custom_campaign_id?: string
    utm_custom_adset_id?: string
    utm_custom_ad_id?: string
    utm_custom_campaign_name?: string
    utm_custom_adset_name?: string
    utm_custom_ad_name?: string
    utm_custom_placement?: string
    utm_custom_site_source_name?: string
}

// Extract utm_param type from the keys of utm_params
export type utm_param = keyof utm_params
