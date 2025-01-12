export default function site_accesses(API_URL: string): void {
    fetch(`${API_URL}/site-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    })
        .then(() => console.log('Site access logged'))
        .catch((err) => console.error('Error logging site access: ', err))
}
