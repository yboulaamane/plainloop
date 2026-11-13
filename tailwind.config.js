/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', '"Iowan Old Style"', 'Palatino', 'serif'],
      },
      colors: {
        canvas: '#f3eee4',
        card: '#fffdf8',
        ink: '#1c1915',
        mute: '#5e574c',
        rule: '#e3d9c6',
        moss: '#1b5e45',
        mossbright: '#3d9a72',
        clay: '#9a4a2b',
        night: '#12110f',
        nightcard: '#1d1a16',
        cream: '#f6f1e7',
      },
      boxShadow: {
        card: '0 18px 40px -28px rgba(28, 25, 21, 0.45)',
      },
    },
  },
  plugins: [],
}
