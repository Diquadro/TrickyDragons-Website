export default function site_accesses(API_URL: string): Promise<Response> {
    return fetch(`${API_URL}/site_access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    })
}
