// src/client/pages/reservation/reservation.config.mjs
export default function reservation_config({ env, BASE_URL }) {
    return {
        filename: 'reservation/index.html',
        import: './src/client/pages/reservation/reservation.pug',
        data: {
            env,
            url: `${BASE_URL}/reservation`,
            title: 'Reservation Confirmed - Tricky Dragons',
            description:
                'Your reservation for Tricky Dragons has been confirmed. Thank you for your interest in our card game.',
            robots: 'noindex, follow',
        },
    }
}
