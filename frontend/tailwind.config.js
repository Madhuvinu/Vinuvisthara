/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef5f0',
          100: '#fde8dc',
          200: '#fbd0be',
          300: '#f8b094',
          400: '#f48562',
          500: '#f1632f',
          600: '#e24a15',
          700: '#bc3a12',
          800: '#963116',
          900: '#7a2d15',
        },
        saree: {
          gold: '#D4AF37',
          maroon: '#800020',
          red: '#DC143C',
        },
        luxury: {
          gold: '#D4AF37',
          beige: '#F5EEE6',
          cream: '#F5EEE6',
          charcoal: '#2C2C2C',
        },
      },
    },
  },
  plugins: [],
};
