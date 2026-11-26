/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        values:       { DEFAULT: '#6366f1', light: '#e0e7ff', dark: '#3730a3' },
        understanding:{ DEFAULT: '#0ea5e9', light: '#e0f2fe', dark: '#0369a1' },
        social:       { DEFAULT: '#10b981', light: '#d1fae5', dark: '#065f46' },
        career:       { DEFAULT: '#f59e0b', light: '#fef3c7', dark: '#92400e' },
        protective:   { DEFAULT: '#ef4444', light: '#fee2e2', dark: '#991b1b' },
        enhancement:  { DEFAULT: '#a855f7', light: '#f3e8ff', dark: '#6b21a8' },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        'shimmer-slide': {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        'spin-around': {
          '0%': {
            transform: 'translateZ(0) rotate(0)',
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)',
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)',
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [],
};
