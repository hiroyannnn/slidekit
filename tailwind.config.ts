import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "var(--font-noto)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        theoria: {
          blue: "#1848A1",
          navy: "#1B4799",
          cyan: "#2FBCE1",
          orange: "#FF924E",
          purple: "#9B33F4",
          teal: "#068FAF",
          "section-blue": "#DDE9FF",
          "section-cream": "#FFE6CF",
          "section-cyan": "#C7EDFB",
          "section-purple": "#E7CBFF",
          dark1: "#1B1B1B",
          dark2: "#3F3F3F",
          light2: "#F4F4F4",
        },
      },
      keyframes: {
        "arrow-flow": {
          "0%, 100%": { transform: "translateX(-6px)", opacity: "0.6" },
          "50%": { transform: "translateX(6px)", opacity: "1" },
        },
        "step-fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "arrow-flow": "arrow-flow 1.6s ease-in-out infinite",
        "step-fade-up":
          "step-fade-up 0.5s ease-out forwards",
        "soft-pulse": "soft-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
