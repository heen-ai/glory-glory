import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        united: {
          red: '#DA291C',
          dark: '#0B0523',
          light: '#FBE122',
        },
      },
      backgroundColor: {
        dark: '#0B0523',
        darker: '#070112',
      },
    },
  },
  plugins: [],
} satisfies Config;
