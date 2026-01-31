/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0f',
        surface: '#111118',
        border: '#2a2a35',
        accent: '#4cc9f0',
        text: {
          primary: '#f0f0f0',
          secondary: '#a0a0a0',
        },
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
