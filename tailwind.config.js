/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-accent': '#334155',
        'primary': '#3B82F6',
        'primary-light': '#60A5FA',
        'primary-dark': '#2563EB',
        'secondary': '#10B981',
        'secondary-light': '#34D399',
        'secondary-dark': '#059669',
        'danger': '#EF4444',
        'danger-light': '#F87171',
        'danger-dark': '#DC2626',
        'warning': '#F59E0B',
        'info': '#8B5CF6',
        'info-light': '#A78BFA',
        'info-dark': '#7C3AED',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        'success': '#22C55E',
        'success-light': '#4ADE80',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'neo': '0.5rem 0.5rem 0 rgba(15, 23, 42, 0.5)',
        'neo-sm': '0.25rem 0.25rem 0 rgba(15, 23, 42, 0.5)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 25px rgba(59, 130, 246, 0.5)',
        'icon': '0 0 10px rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
} 