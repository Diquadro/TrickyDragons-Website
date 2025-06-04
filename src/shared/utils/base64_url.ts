export abstract class Base64_Url {
    // Environment detection
    private static get is_browser(): boolean {
        return typeof window !== 'undefined' && typeof window.btoa === 'function'
    }

    static unescape(str: string | any[]) {
        return (str + '==='.slice((str.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/')
    }

    static escape(str: string) {
        return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    }

    static encode(str: any, encoding?: any) {
        if (Base64_Url.is_browser) {
            // Browser environment - use btoa
            const utf8_bytes = new TextEncoder().encode(str)
            const binary_string = Array.from(utf8_bytes)
                .map((byte) => String.fromCharCode(byte))
                .join('')
            return Base64_Url.escape(btoa(binary_string))
        } else {
            // Node.js environment - use Buffer
            return Base64_Url.escape(Buffer.from(str, encoding ?? 'utf8').toString('base64'))
        }
    }

    static decode(str: string | any[], encoding?: any) {
        if (Base64_Url.is_browser) {
            // Browser environment - use atob
            const binary_string = atob(Base64_Url.unescape(str))
            const uint8_array = new Uint8Array(binary_string.length)
            for (let i = 0; i < binary_string.length; i++) {
                uint8_array[i] = binary_string.charCodeAt(i)
            }
            return new TextDecoder(encoding ?? 'utf-8').decode(uint8_array)
        } else {
            // Node.js environment - use Buffer
            return Buffer.from(Base64_Url.unescape(str), 'base64').toString(encoding ?? 'utf8')
        }
    }

    static encode_json(json: any, encoding?: any) {
        try {
            if (Base64_Url.is_browser) {
                // Browser environment
                const json_string = JSON.stringify(json)
                const utf8_bytes = new TextEncoder().encode(json_string)
                const binary_string = Array.from(utf8_bytes)
                    .map((byte) => String.fromCharCode(byte))
                    .join('')
                return Base64_Url.escape(btoa(binary_string))
            } else {
                // Node.js environment
                return Base64_Url.escape(
                    Buffer.from(JSON.stringify(json), encoding ?? 'utf8').toString('base64'),
                )
            }
        } catch (error) {
            console.error('Failed to encode JSON:', error)
            return ''
        }
    }

    static decode_json(str: string | any[], encoding?: any) {
        try {
            if (Base64_Url.is_browser) {
                // Browser environment
                const binary_string = atob(Base64_Url.unescape(str))
                const uint8_array = new Uint8Array(binary_string.length)
                for (let i = 0; i < binary_string.length; i++) {
                    uint8_array[i] = binary_string.charCodeAt(i)
                }
                const json_string = new TextDecoder(encoding ?? 'utf-8').decode(uint8_array)
                return JSON.parse(json_string)
            } else {
                // Node.js environment
                return JSON.parse(
                    Buffer.from(Base64_Url.unescape(str), 'base64').toString(encoding ?? 'utf8'),
                )
            }
        } catch (error) {
            console.error('Failed to decode JSON:', error)
            return ''
        }
    }
}
