/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./temple_donation/public/js/temple_donation/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's reset to avoid conflicts with Bench/AntD
  }
}
