import { z } from 'zod'

/**
 * Screen infos validation schema
 * Validates screen resolution and viewport size information
 */
export const screen_infos_schema = z.object({
    screen_resolution: z.string().optional(), // e.g., "1920x1080"
    viewport_size: z.string().optional(), // e.g., "1200x800"
})
