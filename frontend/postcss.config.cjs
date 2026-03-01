module.exports = {
  // Use the new PostCSS adapter for Tailwind v4+: '@tailwindcss/postcss'
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};

