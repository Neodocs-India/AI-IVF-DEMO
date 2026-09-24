import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

// Design tokens — CLAUDE.md §9. Do not add colours outside this palette.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      ink: { DEFAULT: '#18263A', 800: '#22324A', 700: '#2D3F5A', 600: '#3A4E6B' },
      lagoon: { DEFAULT: '#0D7377', 700: '#0A5D60', 50: '#E7F2F2', 100: '#CFE5E6' },
      mist: '#F3F6F7',
      paper: '#FFFFFF',
      line: { DEFAULT: '#DCE3E6', strong: '#C5D0D5' },
      saffron: { DEFAULT: '#D9971E', 50: '#FBF3E4', 100: '#F7E6C6' },
      rose: { DEFAULT: '#B83A4B', 50: '#F7E9EB', 100: '#F0D3D7' },
      sage: { DEFAULT: '#4E8B66', 50: '#EBF3EE', 100: '#D6E7DC' },
      slate: { DEFAULT: '#5B6B7C', 300: '#A4AFBB', 400: '#8492A1' },
    },
    fontFamily: {
      sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      serif: ['Newsreader', 'Georgia', 'serif'],
      deva: ['"Noto Sans Devanagari"', '"Instrument Sans"', 'system-ui', 'sans-serif'],
    },
    // Type scale: 12 / 14 / 16 / 20 / 28 / 40
    fontSize: {
      xs: ['12px', { lineHeight: '16px' }],
      sm: ['14px', { lineHeight: '20px' }],
      base: ['16px', { lineHeight: '24px' }],
      lg: ['20px', { lineHeight: '28px' }],
      xl: ['28px', { lineHeight: '36px' }],
      '2xl': ['40px', { lineHeight: '48px' }],
    },
    extend: {
      maxWidth: { content: '1440px' },
      width: { sidebar: '240px' },
      spacing: { sidebar: '240px' },
      borderRadius: { DEFAULT: '6px' },
      boxShadow: {
        drawer: '-12px 0 32px -12px rgba(24, 38, 58, 0.18)',
        pop: '0 8px 24px -8px rgba(24, 38, 58, 0.20)',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
