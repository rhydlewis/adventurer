/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F4E8D0',
        'dark-brown': '#3E2723',
        'deep-red': '#B71C1C',
        'forest-green': '#2E7D32',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
