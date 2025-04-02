import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF4136",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FF6B6B",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#FEE2E2",
          foreground: "#991B1B",
        },
        accent: {
          DEFAULT: "#FF8A8A",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FF4136",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFF5F5",
          foreground: "#991B1B",
        },
        "game-red": "#FF4136",
        "game-green": "#2ECC40",
        "game-violet": "#B10DC9",
        "red-50": "#FFF5F5",
        "red-100": "#FEE2E2",
        "red-200": "#FECACA",
        "red-300": "#FCA5A5",
        "red-400": "#F87171",
        "red-500": "#EF4444",
        "red-600": "#DC2626",
        "red-700": "#B91C1C",
        "red-800": "#991B1B",
        "red-900": "#7F1D1D",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

