import type { Request, Response } from 'express'

/**
 * Get A/B test variant for hero test
 * Returns control or variant with 50/50 random split
 */
export async function get_ab_test_variant(req: Request, res: Response): Promise<void> {
    try {
        // Random 50/50 split
        const variant: 'control' | 'variant' = Math.random() < 0.5 ? 'control' : 'variant'
        res.json({ variant })
    } catch (error) {
        console.error('Error getting A/B test variant:', error)
        // Default to control on error
        res.json({ variant: 'control' })
    }
}
