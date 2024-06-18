import forms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const accessibility = plugin(function ({ addVariant }) {
  addVariant('transparency-reduce', [
    '@media (prefers-reduced-transparency)',
    '[data-transparency="reduce"] &'
  ]);
});

const config: Config = {
  content: ['src/**/*.{ts,tsm,svelte,html}'],
  darkMode: ['selector', '[data-color-scheme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Titillium Web', ...defaultTheme.fontFamily.sans],
        serif: ['"Ibarra Real Nova"', ...defaultTheme.fontFamily.serif],
      },
      animation: {
        breathe: 'breathe 3s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.01)' },
        },
      },
      boxShadow: {
        'inner-sm':
          'inset 0 1px 2px 0 rgba(0, 0, 0, 0.06), inset 0 -2px 1px 0 rgba(255, 255, 255, 0.06)',
      },
      spacing: {
        '1/6': 'calc(100% / 6)',
      },
      ringWidth: {
        ...defaultTheme.ringWidth,
        6: '6px'
      }
    },
  },
  plugins: [forms, accessibility],
};

export default config;
