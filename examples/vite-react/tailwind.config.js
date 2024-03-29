/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    './src/**/*.{ts,tsx}'
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
    require('fancy-ansi/plugin')
  ]
}
