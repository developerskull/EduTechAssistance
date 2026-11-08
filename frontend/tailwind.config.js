/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          'blue-hover': '#1557b0',
          'blue-light': '#e8f0fe',
          'blue-surface': '#d2e3fc',
          green: '#137333',
          'green-light': '#e6f4ea',
          yellow: '#f29900',
          'yellow-light': '#fef7e0',
          red: '#d93025',
          'red-light': '#fce8e6',
          text: '#3c4043',
          'text-dark': '#202124',
          'text-subtle': '#5f6368',
          surface: '#ffffff',
          bg: '#f8f9fa',
          border: '#dadce0',
        },
        brand: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          500: '#1a73e8',
          600: '#1967d2',
          700: '#1557b0',
          900: '#174ea6',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
