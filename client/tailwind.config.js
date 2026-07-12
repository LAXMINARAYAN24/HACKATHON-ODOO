/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── AssetFlow Brand Palette (extracted from logo) ──────────────────
        // Primary: Amber/Gold  (#F5A800 family)
        primary: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",   // main brand amber
          600: "#d97706",   // hover
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Dark charcoal surfaces (from logo dark elements)
        surface: {
          DEFAULT: "#1c1e26",
          50:  "#252830",
          100: "#1e2029",
          200: "#171921",
        },
        dark:   "#0f1014",
        border: "#2c2e38",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 0 0 3px rgba(245, 158, 11, 0.25)",
        "brand-lg": "0 8px 32px rgba(245, 158, 11, 0.15)",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
