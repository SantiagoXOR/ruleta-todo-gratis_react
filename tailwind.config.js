/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'pintemas-purple': '#811468',
        'pintemas-yellow': '#ffe200',
        'pintemas-purple-light': '#9d1a7f',
        'pintemas-purple-dark': '#650f51',
        'pintemas-yellow-light': '#fff433',
        'pintemas-yellow-dark': '#ccb500',
      },
    },
  },
  plugins: [],
};

