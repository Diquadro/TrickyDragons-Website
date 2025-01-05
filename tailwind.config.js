/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./dist/**/*.{html,js}'],
    theme: {
        extend: {
            fontSize: {
                '6xl': ['4rem', '4rem'],
            },
        },
    },
    plugins: [],
}
