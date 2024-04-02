/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@kubetail/ui/**/*.js'
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
    require('@kubetail/ui/plugin'),
    require('fancy-ansi/plugin')
  ],
}
