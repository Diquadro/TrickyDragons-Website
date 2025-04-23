export abstract class Base64_Url {
    static unescape(str: string | any[]) {
        return (str + '==='.slice((str.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/')
    }

    static escape(str: string) {
        return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    }

    static encode(str: any, encoding?: any) {
        return Base64_Url.escape(Buffer.from(str, encoding ?? 'utf8').toString('base64'))
    }

    static decode(str: string | any[], encoding?: any) {
        return Buffer.from(Base64_Url.unescape(str), 'base64').toString(encoding ?? 'utf8')
    }

    static encode_json(json: any, encoding?: any) {
        try {
            return Base64_Url.escape(Buffer.from(JSON.stringify(json), encoding ?? 'utf8').toString('base64'))
        } catch (error) {
            console.error('Failed to encode JSON:', error)
            return ''
        }
    }

    static decode_json(str: string | any[], encoding?: any) {
        try {
            return JSON.parse(Buffer.from(Base64_Url.unescape(str), 'base64').toString(encoding ?? 'utf8'))
        } catch (error) {
            console.error('Failed to decode JSON:', error)
            return ''
        }
    }
}
