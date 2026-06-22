import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF5F0',
          100: '#FFE8DB',
          200: '#FFCDB6',
          300: '#FFAB87',
          400: '#FF8A5C',
          500: '#FF6B35',
          600: '#E85A24',
          700: '#C14A1C',
          800: '#9A3C18',
          900: '#7D3216',
        },
        warm: {
          50: '#FAF7F5',
          100: '#F5F0EB',
          200: '#EBE3DB',
          300: '#DDD2C7',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        num: ['DIN Alternate', 'Avenir Next', 'tabular-nums'],
      },
      fontSize: {
        'h1': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'h2': ['16px', { lineHeight: '24px', fontWeight: '700' }],
        'body': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'tiny': ['10px', { lineHeight: '14px', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'modal': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06)',
        'float': '0 4px 12px rgba(0,0,0,0.08)',
        'modal': '0 8px 24px rgba(0,0,0,0.12)',
        'coral': '0 4px 12px rgba(255,107,53,0.25)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'heartbeat': 'heartbeat 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 0.8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(0.95)' },
          '75%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
