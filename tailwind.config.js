/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        'var(--bg)',
        surface:   'var(--surface)',
        surface2:  'var(--surface2)',
        border:    'var(--border)',
        accent:    'var(--accent)',
        accent2:   'var(--accent2)',
        'text-base': 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
      },
      borderRadius: {
        DEFAULT: 'var(--r)',
      },
    },
  },
  plugins: [],
};
