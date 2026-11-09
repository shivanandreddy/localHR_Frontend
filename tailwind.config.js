/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- Crucial: enables class-based dark mode toggling
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}