import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '2px',
      md: '2px',
      lg: '2px',
      xl: '2px',
      '2xl': '2px',
      full: '9999px',
    },
    extend: {
      colors: {
        united: {
          red: '#DA291C',
          light: '#FBE122',
        },
        bg: '#0a0a0a',
        surface: '#111111',
      },
      backgroundColor: {
        bg: '#0a0a0a',
        surface: '#111111',
      },
    },
  },
  plugins: [],
} satisfies Config;
