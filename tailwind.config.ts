import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0a0a",
          card: "#121212",
          accent: "#eab308", // gold-ish
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
