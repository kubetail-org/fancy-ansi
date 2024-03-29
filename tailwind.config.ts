import fancyAnsiPlugin from './src/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    './hack/**/*.{ts,tsx}'
  ],
  theme: {
    //ansi: 'xxx',
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
    fancyAnsiPlugin,
  ]
}
