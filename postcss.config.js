// Force Next.js to use Tailwind v3 via PostCSS and not the Tailwind v4 plugin.
// Keep this minimal to avoid requiring extra packages like 'autoprefixer'.

module.exports = {
  plugins: {
    tailwindcss: {},
    // If you later add 'autoprefixer' to devDependencies, you can enable it here:
    // autoprefixer: {},
  },
}
