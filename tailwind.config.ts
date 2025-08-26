import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'kanit': ['var(--font-kanit)', 'sans-serif'],
        'museo-moderno': ['var(--font-museo-moderno)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;