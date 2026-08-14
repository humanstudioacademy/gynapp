/**
 * Tokens de design — fonte única de verdade para cor, espaçamento e tipografia.
 * Espelha docs/07-design-system-e-ux.md. Nunca usar hex direto em componente.
 */

export const palette = {
  brand: {
    50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399',
    500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D',
  },
  neutral: {
    0: '#FFFFFF', 50: '#FAFAFA', 100: '#F4F4F5', 200: '#E4E4E7', 300: '#D4D4D8',
    400: '#A1A1AA', 500: '#71717A', 600: '#52525B', 700: '#3F3F46', 800: '#27272A',
    900: '#18181B', 950: '#0B0B0F',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  accent: { pr: '#FBBF24', volume: '#8B5CF6', streak: '#F97316' },
} as const;

export type ThemeColors = {
  bg: string;
  bgElevated: string;
  bgSubtle: string;
  border: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  primaryText: string;
  danger: string;
  warning: string;
  success: string;
};

export const lightTheme: ThemeColors = {
  bg: palette.neutral[50],
  bgElevated: palette.neutral[0],
  bgSubtle: palette.neutral[100],
  border: palette.neutral[200],
  text: palette.neutral[900],
  textSecondary: palette.neutral[500],
  textInverse: palette.neutral[0],
  primary: palette.brand[600],
  primaryText: palette.neutral[0],
  danger: palette.danger,
  warning: palette.warning,
  success: palette.success,
};

export const darkTheme: ThemeColors = {
  bg: palette.neutral[950],
  bgElevated: palette.neutral[900],
  bgSubtle: palette.neutral[800],
  border: palette.neutral[800],
  text: palette.neutral[50],
  textSecondary: palette.neutral[400],
  textInverse: palette.neutral[950],
  primary: palette.brand[500],
  primaryText: palette.neutral[950],
  danger: palette.danger,
  warning: palette.warning,
  success: palette.success,
};

/** Escala de 4pt */
export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48,
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '500', lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
} as const;

/** Alvos de toque — iOS HIG 44pt / Material 48dp */
export const layout = {
  screenPadding: spacing.lg,
  minTouchTarget: 44,
  ctaHeight: 56,
  listRowHeight: 56,
} as const;
