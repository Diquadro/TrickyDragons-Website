export default function send_email(API_URL: string, email: string): Promise<Response> {
    return fetch(`${API_URL}/email_subscription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
}
