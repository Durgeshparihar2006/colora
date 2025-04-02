/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#2D1B2E',
        primary: '#FF4136',
        secondary: '#2ECC40',
        accent: '#B10DC9',
        border: '#374151',
      },
    },
  },
  plugins: [],
} 