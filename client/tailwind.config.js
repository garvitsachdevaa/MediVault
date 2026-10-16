/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // The dev-only /ui-preview gallery builds palette swatch classes dynamically
  // (e.g. `bg-accent-500`), which the JIT scanner can't see. Safelist them so
  // the design-system preview renders. These add negligible CSS and only via
  // the dev gallery.
  safelist: [
    { pattern: /^bg-(accent|ink)-(50|100|200|300|400|500|600|700|800|900)$/ },
  ],
  theme: {
    extend: {
      colors: {
        // ── Accent ─────────────────────────────────────────────────────────
        // A refined teal — calm, clinical, trustworthy. Full 50–900 ramp so
        // we can tune emphasis precisely instead of relying on opacity hacks.
        // `accent.DEFAULT`/`light`/`dark` are kept for backward compatibility.
        accent: {
          50: '#edfbf8',
          100: '#d2f4ee',
          200: '#a8e9df',
          300: '#73d7cb',
          400: '#3dbcb0',
          500: '#17a195',
          600: '#0d8378',
          700: '#0f6960',
          800: '#115450',
          900: '#114742',
          light: '#73d7cb',
          DEFAULT: '#0d8378',
          dark: '#0f6960',
        },
        // ── Neutral ink ────────────────────────────────────────────────────
        // A gently cool, desaturated slate ramp. Softer than default Tailwind
        // slate so large surfaces read calm rather than harsh.
        ink: {
          50: '#f7f9fa',
          100: '#eef2f4',
          200: '#dde4e8',
          300: '#c3ced4',
          400: '#93a3ac',
          500: '#687782',
          600: '#4e5c66',
          700: '#3b464f',
          800: '#28313a',
          900: '#19212a',
        },
        // ── Semantic status ────────────────────────────────────────────────
        // Each pairs a soft bg + a strong fg (AA on its own bg). Always shown
        // with an icon + text label in the UI — never colour alone.
        status: {
          // normal / verified — green
          normal: '#15803d',
          'normal-bg': '#e8f6ec',
          'normal-border': '#c3e6cd',
          // needs review / borderline — amber
          review: '#b45309',
          'review-bg': '#fdf3e3',
          'review-border': '#f3ddb4',
          // out of range / failed — red
          danger: '#b91c1c',
          'danger-bg': '#fdecec',
          'danger-border': '#f4cccc',
          // pending / unknown — grey
          pending: '#4e5c66',
          'pending-bg': '#eef2f4',
          'pending-border': '#dde4e8',
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
      // ── Type scale ───────────────────────────────────────────────────────
      // A considered scale with paired line-heights + tracking. Display/H1 are
      // tight and confident; body is relaxed and readable.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        xs: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.005em' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1rem', { lineHeight: '1.65rem' }],
        lg: ['1.125rem', { lineHeight: '1.7rem', letterSpacing: '-0.005em' }],
        xl: ['1.3125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.625rem', { lineHeight: '2.1rem', letterSpacing: '-0.016em' }],
        '3xl': ['2rem', { lineHeight: '2.4rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.5rem', { lineHeight: '2.8rem', letterSpacing: '-0.024em' }],
        '5xl': ['3.25rem', { lineHeight: '3.4rem', letterSpacing: '-0.028em' }],
        '6xl': ['4rem', { lineHeight: '4.1rem', letterSpacing: '-0.032em' }],
      },
      // ── Radius tokens ──────────────────────────────────────────────────
      borderRadius: {
        lg: '0.625rem', // controls
        xl: '0.875rem', // inputs / small cards
        '2xl': '1.125rem', // cards
        '3xl': '1.5rem', // large surfaces / hero panels
      },
      // ── Soft, layered shadows ──────────────────────────────────────────
      boxShadow: {
        xs: '0 1px 2px 0 rgba(25, 33, 42, 0.04)',
        sm: '0 1px 2px rgba(25, 33, 42, 0.04), 0 1px 3px rgba(25, 33, 42, 0.05)',
        card: '0 1px 2px rgba(25, 33, 42, 0.04), 0 6px 16px -8px rgba(25, 33, 42, 0.10)',
        lift: '0 2px 4px rgba(25, 33, 42, 0.05), 0 14px 30px -12px rgba(25, 33, 42, 0.18)',
        float: '0 10px 40px -12px rgba(17, 105, 96, 0.22), 0 4px 12px -6px rgba(25, 33, 42, 0.12)',
        ring: '0 0 0 4px rgba(13, 131, 120, 0.14)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      backgroundImage: {
        'accent-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
