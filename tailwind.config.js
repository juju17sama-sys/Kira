/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'Cormorant Garamond', 'serif'],
        body: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        marble: '#f4ecdc',
        gold: {
          DEFAULT: '#c9a24a',
          light: '#e9c97a',
          deep: '#7a5a1d',
        },
        violet: {
          sacred: '#8a4dd6',
          deep: '#3a1a5e',
        },
        ink: '#1a140c',
      },
      animation: {
        'flame-flicker': 'flicker 2.4s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
};
