import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#059669",
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
        },
        mint: {
          50: "#f0fdf9",
          100: "#ccfbf1",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "page-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-forward": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-back": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "modal-backdrop-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "modal-backdrop-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "modal-panel-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "modal-panel-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "modal-panel-in-md": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "modal-panel-out-md": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "reveal-up": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s fluid both",
        "fade-out": "fade-out 0.32s ease-in both",
        "page-fade-in": "page-fade-in 0.5s fluid both",
        "fade-in-up": "fade-in-up 0.45s fluid both",
        "slide-in-forward": "slide-in-forward 0.45s fluid both",
        "slide-in-back": "slide-in-back 0.45s fluid both",
        "modal-backdrop-in": "modal-backdrop-in 0.28s ease-out both",
        "modal-backdrop-out": "modal-backdrop-out 0.22s ease-in both",
        "modal-panel-in": "modal-panel-in 0.42s fluid both",
        "modal-panel-out": "modal-panel-out 0.3s ease-in both",
        "modal-panel-in-md": "modal-panel-in-md 0.42s fluid both",
        "modal-panel-out-md": "modal-panel-out-md 0.3s ease-in both",
        "reveal-up": "reveal-up 0.45s fluid both",
      },
    },
  },
  plugins: [],
};

export default config;
