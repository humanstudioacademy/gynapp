/** @type {import('tailwindcss').Config} */
// Espelha src/theme/tokens.ts. Ao mudar um valor aqui, mude lá também.
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' (e não 'media') porque a preferência do usuário em user_settings.theme
  // sobrescreve a do sistema — o ThemeProvider chama colorScheme.set().
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Lima ácido. Preenchimento sempre com texto `neutral-950`:
        // branco sobre lima dá 1.16:1 e é proibido pelo design system.
        // Como TEXTO em fundo claro, só `brand-800` passa (6.48:1).
        brand: {
          50: '#F4FFE0',
          100: '#E9FFC0',
          200: '#DEFF96',
          300: '#DBFF6B',
          400: '#D2FF3A',
          500: '#C2F224',
          600: '#A3CC1F',
          700: '#7A991A',
          800: '#4F6610',
          900: '#2E3B0A',
        },
        // Neutros levemente esverdeados — preto puro vibra ao lado do lima.
        neutral: {
          0: '#FFFFFF',
          50: '#F5F7F2',
          100: '#E8EBE4',
          200: '#CFD4C9',
          300: '#A8B0A2',
          400: '#767C72',
          500: '#565B53',
          600: '#3D423B',
          700: '#2F332C',
          800: '#21251F',
          900: '#161915',
          950: '#0A0B0A',
        },
        success: '#7AE582',
        warning: '#FFC53D',
        danger: '#FF5C5C',
        info: '#4FC3F7',
        // Variantes de tema claro — os tons escuros acima reprovam em fundo branco.
        'success-ink': '#1F8A3B',
        'warning-ink': '#B77800',
        'danger-ink': '#D92D2D',
        pr: '#FFC53D',
        volume: '#D2FF3A',
        streak: '#FF7A2F',
        series: '#A78BFA',
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
      },
      fontSize: {
        metric: ['40px', { lineHeight: '44px', letterSpacing: '-1px' }],
        'metric-xl': ['56px', { lineHeight: '60px', letterSpacing: '-1.5px' }],
        overline: ['11px', { lineHeight: '14px', letterSpacing: '1.2px' }],
      },
    },
  },
  plugins: [],
};
