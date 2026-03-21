import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        contrast: 'var(--contrast)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        muted2: 'var(--muted2)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        red: 'var(--red)',
        amber: 'var(--amber)',
        blue: 'var(--blue)',
        teal: 'var(--teal)',
        purple: 'var(--purple)',
        border: 'var(--border)',
        border2: 'var(--border2)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        border: 'var(--border)',
        border2: 'var(--border2)',
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'sidebar-w': '220px',
        'nav-h': '56px',
        8: '0.5rem',
        9: '0.5625rem',
        10: '0.625rem',
        13: '0.8125rem',
      },
      fontSize: {
        8: ['8px', { lineHeight: '1' }],
        9: ['9px', { lineHeight: '1' }],
        10: ['10px', { lineHeight: '1' }],
        '10.5': ['10.5px', { lineHeight: '1' }],
        '11': ['11px', { lineHeight: '1' }],
        '11.5': ['11.5px', { lineHeight: '1' }],
        '12': ['12px', { lineHeight: '1' }],
        '12.5': ['12.5px', { lineHeight: '1' }],
        '13': ['13px', { lineHeight: '1' }],
        '13.5': ['13.5px', { lineHeight: '1' }],
        '14': ['14px', { lineHeight: '1.6' }],
        '15': ['15px', { lineHeight: '1' }],
        '18': ['18px', { lineHeight: '1' }],
        '20': ['20px', { lineHeight: '1' }],
        '22': ['22px', { lineHeight: '1' }],
        '28': ['28px', { lineHeight: '1' }],
        '42': ['42px', { lineHeight: '1' }],
        '5': ['20px', { lineHeight: '1' }],
      },
      width: {
        'sidebar-w': '220px',
        22: '5.5rem',
        36: '2.25rem',
        40: '2.5rem',
      },
      height: {
        'nav-h': '56px',
        22: '5.5rem',
        28: '1.75rem',
        36: '2.25rem',
      },
      backgroundColor: {
        'opacity-10': 'rgba(200, 240, 96, 0.1)',
        'opacity-12': 'rgba(200, 240, 96, 0.12)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.3s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-out': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        'slide-in': {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          'from': { transform: 'translateY(-20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
