export default function send_email(API_URL: string, email: string): void {
    fetch(`${API_URL}/email_subscription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
        .then(() => console.log('Email sent'))
        .catch((err) => console.error('Error sending email: ', err))
}
