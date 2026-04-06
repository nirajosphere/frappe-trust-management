module.exports = {
  content: [
    "./temple_donation/public/js/temple_donation/**/*.{js,jsx,ts,tsx}",
  ],
  important: '.temple-donation-app', // Scope all Tailwind utilities
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18181b', // Our Monochrome Black
          hover: '#000000',
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
