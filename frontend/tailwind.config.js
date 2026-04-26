export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff', // indigo-50
          500: '#6366f1', // indigo-500
          600: '#4f46e5', // indigo-600
          900: '#312e81', // indigo-900
        },
        secondary: {
          100: '#f1f5f9', // slate-100
          800: '#1e293b', // slate-800
        }
      }
    },
  },
  plugins: [],
}
