/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

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
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      // One set of names for the whole site. The values live in index.css
      // and flip for the dark workbench, so components never need `dark:`.
      colors: {
        bench: v('bench'),     // the workbench the paper sits on
        sheet: v('sheet'),     // paper
        ink: v('ink'),         // text, borders, the pressed side of a key
        soft: v('soft'),       // second-voice text, still easy to read
        rule: v('rule'),       // pencil lines
        accent: v('accent'),   // the one strong colour: lit, live, chosen
        onaccent: v('onaccent'),
        edge: v('edge'),       // the thickness under a key
      },
      boxShadow: {
        sheet: '6px 6px 0 0 rgb(var(--ink) / 0.14)',
        key: '0 4px 0 0 rgb(var(--edge))',
      },
    },
  },
  plugins: [],
}
