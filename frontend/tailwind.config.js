/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fdf5',
          100: '#e2faea',
          200: '#c6f3d4',
          300: '#99e8b0',
          400: '#63d384',
          500: '#34b259', // Core Agrishare Green
          600: '#279848',
          700: '#21783c',
          800: '#1e5f33',
          900: '#1a4e2c',
          950: '#0b2b16',
        },
        darkbg: {
          50: '#1f2937',
          100: '#111827',
          200: '#030712'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
