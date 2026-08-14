/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' (e não 'media') porque a preferência do usuário em user_settings.theme
  // sobrescreve a do sistema — o ThemeProvider chama colorScheme.set().
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#0B0B0F',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        pr: '#FBBF24',
        volume: '#8B5CF6',
        streak: '#F97316',
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '24px' },
    },
  },
  plugins: [],
};
