/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mutedLavender: '#A78BFA',
        deepViolet: '#4C1D95',
        lavenderMist: '#F3E8FF',
        pureWhite: '#FFFFFF',
        amberDust: '#FBBF24',
        skyBlueSoft: '#38BDF8',
        oceanNavyMuted: '#0C4A6E',
      },
      gridTemplateColumns: {
        '7': 'repeat(7, minmax(0, 1fr))',
        '10': 'repeat(10, minmax(0, 1fr))',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
