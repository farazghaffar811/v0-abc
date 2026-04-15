// Tailwind v3 PostCSS pipeline
// Ensures Next uses Tailwind v3 instead of trying to load the v4 plugin.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
