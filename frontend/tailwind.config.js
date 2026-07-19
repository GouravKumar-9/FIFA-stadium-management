/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stadium: {
          dark: '#030712', // deep gray/black
          card: 'rgba(17, 24, 39, 0.7)', // glass card background
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#10B981', // Emerald green
          brand: '#2563EB', // FIFA royal blue
          gold: '#F59E0B' // Warning yellow
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
