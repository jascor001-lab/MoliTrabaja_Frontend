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
        "page-fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "page-slide-forward": {
          from: { opacity: "0", transform: "translateX(28px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "page-slide-back": {
          from: { opacity: "0", transform: "translateX(-28px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-forward": {
          from: { opacity: "0", transform: "translateX(32px) scale(0.98)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "slide-in-back": {
          from: { opacity: "0", transform: "translateX(-32px) scale(0.98)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "drawer-in-right": {
          from: { opacity: "0.6", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "drawer-out-right": {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0.6", transform: "translateX(100%)" },
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
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "modal-panel-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(100%)" },
        },
        "modal-panel-in-md": {
          from: {
            opacity: "0",
            transform: "translateY(20px) scale(0.96)",
          },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "modal-panel-out-md": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: {
            opacity: "0",
            transform: "translateY(16px) scale(0.97)",
          },
        },
        "reveal-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-out": "fade-out 0.28s ease-in both",
        "page-fade-in-up": "page-fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "page-slide-forward":
          "page-slide-forward 0.48s cubic-bezier(0.22, 1, 0.36, 1) both",
        "page-slide-back": "page-slide-back 0.48s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-up": "fade-in-up 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-forward":
          "slide-in-forward 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-back": "slide-in-back 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "drawer-in-right":
          "drawer-in-right 0.38s cubic-bezier(0.22, 1, 0.36, 1) both",
        "drawer-out-right": "drawer-out-right 0.32s ease-in both",
        "modal-backdrop-in": "modal-backdrop-in 0.3s ease-out both",
        "modal-backdrop-out": "modal-backdrop-out 0.24s ease-in both",
        "modal-panel-in": "modal-panel-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "modal-panel-out": "modal-panel-out 0.3s ease-in both",
        "modal-panel-in-md":
          "modal-panel-in-md 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "modal-panel-out-md": "modal-panel-out-md 0.3s ease-in both",
        "reveal-up": "reveal-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
