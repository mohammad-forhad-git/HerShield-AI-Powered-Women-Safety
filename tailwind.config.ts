import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#101828",
          900: "#0B1220",
          800: "#101828",
          700: "#1D2939",
          600: "#344054",
        },
        royal: { DEFAULT: "#2563EB", 600: "#2563EB", 700: "#1D4ED8", 50: "#EFF6FF" },
        sos: { DEFAULT: "#DC2626", 600: "#DC2626", 700: "#B91C1C", 50: "#FEF2F2" },
        success: { DEFAULT: "#16A34A" },
        warning: { DEFAULT: "#F59E0B" },
        canvas: "#F8FAFC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        lift: "0 12px 32px -12px rgba(16,24,40,0.18)",
        sos: "0 0 0 10px rgba(220,38,38,0.08), 0 20px 40px -12px rgba(220,38,38,0.45)",
      },
      keyframes: {
        "sos-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "sos-pulse": "sos-pulse 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
