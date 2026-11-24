/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B81104',
          dark: '#8B0000',
          light: '#D42B1F',
        },
        cream: {
          DEFAULT: '#FFFACD',
          dark: '#FFF5A0',
          darker: '#F5EDA0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      }
    }
  },
  plugins: []
}
