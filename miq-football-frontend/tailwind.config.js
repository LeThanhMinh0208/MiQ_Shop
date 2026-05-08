/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                // Color palette "Daylight Stadium"
                primary: {
                    DEFAULT: '#10B981', // Neon green - CTA chính
                    light: '#34D399',
                    dark: '#059669',
                    neon: '#00C853', // Highlight đặc biệt
                },
                ink: {
                    DEFAULT: '#1F2937', // Charcoal text
                    light: '#374151',
                    muted: '#6B7280',
                },
                cream: {
                    DEFAULT: '#F8F9FA', // Background sáng
                    50: '#FFFFFF',
                    100: '#F8F9FA',
                    200: '#E5E7EB',
                },
            },
            fontFamily: {
                display: ['Oswald', 'sans-serif'], // Tiêu đề mạnh mẽ
                body: ['Inter', 'sans-serif'], // Body text
            },
            boxShadow: {
                'neon': '0 0 30px rgba(16, 185, 129, 0.4)',
                'neon-lg': '0 0 60px rgba(16, 185, 129, 0.6)',
                'pedestal': '0 20px 40px -10px rgba(16, 185, 129, 0.3)',
            },
            animation: {
                'levitate': 'levitate 4s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                levitate: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(2deg)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};