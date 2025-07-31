/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0d0b17",
        gray: {
          500: "#8a8a94",
        },
        white: "#ffffff",
        purple: {
          light: "#a78bfa",
          DEFAULT: "#8b5cf6",
          dark: "#6366f1",
        },
        yellow: {
          DEFAULT: "#facc15",
        },
        green: {
          DEFAULT: "#16c784",
        },
        red: {
          DEFAULT: "#ef4444",
        },
        orange: {
          DEFAULT: "#f97316",
        },
      },
    },
  },
  plugins: [],
};
