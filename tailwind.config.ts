import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/app.vue',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        piutang: {
          bg: '#fef3c7',
          text: '#92400e',
          dot: '#f59e0b',
          dark: {
            bg: '#451a03',
            text: '#fde68a',
            dot: '#fbbf24',
          },
        },
        lunas: {
          bg: '#dcfce7',
          text: '#166534',
          dot: '#22c55e',
          dark: {
            bg: '#052e16',
            text: '#bbf7d0',
            dot: '#4ade80',
          },
        },
        bonus: {
          bg: '#f3e8ff',
          text: '#6b21a8',
          dot: '#a855f7',
          dark: {
            bg: '#3b0764',
            text: '#e9d5ff',
            dot: '#c084fc',
          },
        },
        danger: {
          DEFAULT: '#ef4444',
          text: '#dc2626',
          darkText: '#f87171',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
      },
    },
  },
} satisfies Config
