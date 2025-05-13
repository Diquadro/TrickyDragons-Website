export interface Utm_Params {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    [key: string]: string | undefined
}

// Private cache variable
let utm_params_cache: Utm_Params | null = null

/**
 * Extracts all UTM parameters from the current URL with caching
 * @param force_refresh Force recalculation of UTM parameters even if cached
 * @returns Object containing all UTM parameters
 */
export function get_utm_params(force_refresh: boolean = false): Utm_Params {
    // Return cached results if already computed and no refresh requested
    if (utm_params_cache !== null && !force_refresh) {
        return utm_params_cache
    }

    // Get the current URL
    const current_url = window.location.href

    // Create a URL object to easily extract parameters
    const url_obj = new URL(current_url)
    const search_params = url_obj.searchParams

    // Create an object to store UTM parameters
    const utm_params: Utm_Params = {}

    // Extract all parameters that start with "utm_"
    search_params.forEach((value, key) => {
        if (key.startsWith('utm_')) {
            utm_params[key] = value
        }
    })

    // Cache the results
    utm_params_cache = utm_params

    return utm_params
}
