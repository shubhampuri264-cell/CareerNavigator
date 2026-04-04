/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        },
        // Role-specific accent colors — used in ScoreCards and role badges
        role: {
          PM:   '#f59e0b',  // amber-400
          SWE:  '#3b82f6',  // blue-500
          ML:   '#8b5cf6',  // violet-500
          Data: '#10b981',  // emerald-500
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  // Safelist dynamic role colors used in ScoreCard
  safelist: [
    'bg-amber-500', 'border-amber-400', 'text-amber-700', 'bg-amber-50',
    'bg-blue-500',  'border-blue-400',  'text-blue-700',  'bg-blue-50',
    'bg-violet-500','border-violet-400','text-violet-700','bg-violet-50',
    'bg-emerald-500','border-emerald-400','text-emerald-700','bg-emerald-50',
  ],
}
