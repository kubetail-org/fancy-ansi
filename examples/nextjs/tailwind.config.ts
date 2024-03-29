import type { Config } from "tailwindcss";
import fancyAnsiPlugin from 'fancy-ansi/plugin';

const config: Config = {
  darkMode: 'selector',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
    fancyAnsiPlugin,
  ],
};

export default config;
