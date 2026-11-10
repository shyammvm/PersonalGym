/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          950: '#090a0f',
          900: '#12141c',
          850: '#181b26',
          800: '#1e2230',
          700: '#2b3044',
          accent: '#10b981', // Emerald green gym accent
          neon: '#06d6a0',
          warning: '#f59e0b',
          danger: '#ef4444',
          blue: '#3b82f6',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
