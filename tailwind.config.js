/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)'
        },
        foreground: {
          DEFAULT: 'var(--foreground)'
        }
      }
    },
  },
  plugins: [
    require('fancy-ansi/plugin'),
    require('@tailwindcss/forms')
  ],
}
