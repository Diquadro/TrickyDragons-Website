interface Window {
    umami?: {
        track: (event: string, options?: Record<string, any>) => void
    }
}
