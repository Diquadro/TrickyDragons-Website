import { getFingerprint } from '@thumbmarkjs/thumbmarkjs'

let cached_fingerprint: string | null = null

export async function get_device_fingerprint(): Promise<string | null> {
    // Return cached fingerprint if available
    if (cached_fingerprint) {
        return cached_fingerprint
    }

    try {
        // Generate fingerprint once
        cached_fingerprint = await getFingerprint()
        return cached_fingerprint
    } catch (error) {
        console.warn('Failed to generate device fingerprint:', error)
        return null
    }
}
