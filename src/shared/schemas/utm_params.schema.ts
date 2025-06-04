import { z } from 'zod'

/**
 * Reusable UTM parameters schema for validation
 * Matches the utm_params interface and ALL_UTM_PARAMETERS constants
 */
export const utm_params_schema = z.object({
    // Standard UTM parameters
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
    utm_id: z.string().optional(),

    // Custom UTM parameters for Meta ads and other platforms
    utm_custom_campaign_id: z.string().optional(),
    utm_custom_adset_id: z.string().optional(),
    utm_custom_ad_id: z.string().optional(),
    utm_custom_campaign_name: z.string().optional(),
    utm_custom_adset_name: z.string().optional(),
    utm_custom_ad_name: z.string().optional(),
    utm_custom_placement: z.string().optional(),
    utm_custom_site_source_name: z.string().optional(),
})

export type Utm_Params_Schema = z.infer<typeof utm_params_schema>
