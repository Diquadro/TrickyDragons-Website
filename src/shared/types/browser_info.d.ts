// Browser information interface
export interface browser_info {
    name?: string // Browser name (e.g., Chrome, Firefox, Safari)
    version?: string // Browser version (e.g., 91.0.4472.124)
    os?: string // Operating system (e.g., Windows, macOS, Linux, Android, iOS)
    os_version?: string // OS version (e.g., 10, 11.0, 14.4)
    device_type?: string // Device type (desktop, mobile, tablet)
}

// Extends Express Request with browser information
declare global {
    namespace Express {
        interface Request {
            browser_info?: browser_info
        }
    }
}
