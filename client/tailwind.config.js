/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Single accent colour (teal — calm, health-oriented).
        accent: {
          light: '#5eead4',
          DEFAULT: '#0d9488',
          dark: '#0f766e',
        },
        // Status colours. Always paired with an icon + text label in the UI,
        // never colour alone (accessibility).
        status: {
          normal: '#16a34a', // green: normal / verified
          'normal-bg': '#dcfce7',
          review: '#d97706', // amber: needs review / borderline
          'review-bg': '#fef3c7',
          danger: '#dc2626', // red: out of range / failed
          'danger-bg': '#fee2e2',
          pending: '#64748b', // grey: pending / unknown
          'pending-bg': '#f1f5f9',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
