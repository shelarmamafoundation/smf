/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          burgundy: '#3D0C11',
          crimson: '#5C131A',
          gold: '#C5A059',
          goldLight: '#E5C378',
          cream: '#FAF7F2',
          card: '#F4ECE1',
          charcoal: '#1C1917',
          muted: '#6B5E55'
        }
      },
      fontFamily: {
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}