/**
 * Tokens de design — fonte única de verdade para cor, espaçamento e tipografia.
 * Espelha docs/07-design-system-e-ux.md. Nunca usar hex direto em componente.
 *
 * v2 — "Lima sobre tinta". Os contrastes anotados abaixo são medidos (WCAG 2.1),
 * não estimados. A regra que sustenta o sistema inteiro:
 * **lima nunca recebe texto branco** (1.16:1) — sempre tinta quase preta (17:1).
 */

export const palette = {
  /**
   * Marca — lima ácido. 400 é a assinatura: preenchimento de CTA no escuro e
   * cor de acento. 800 existe para um único fim: texto lima em fundo claro
   * (6.48:1). Os passos 500–700 são só para preenchimento/pressed — como texto
   * em fundo claro eles reprovam (600 dá 1.87:1).
   */
  brand: {
    50: '#F4FFE0', 100: '#E9FFC0', 200: '#DEFF96', 300: '#DBFF6B', 400: '#D2FF3A',
    500: '#C2F224', 600: '#A3CC1F', 700: '#7A991A', 800: '#4F6610', 900: '#2E3B0A',
  },
  /**
   * Neutros levemente esverdeados — preto puro "aponta" para o lima e cria
   * vibração de borda. O passo 950→900 é a elevação padrão do tema escuro
   * (1.11:1): visível como camada, invisível como mudança de cor.
   */
  neutral: {
    0: '#FFFFFF', 50: '#F5F7F2', 100: '#E8EBE4', 200: '#CFD4C9', 300: '#A8B0A2',
    400: '#767C72', 500: '#565B53', 600: '#3D423B', 700: '#2F332C', 800: '#21251F',
    900: '#161915', 950: '#0A0B0A',
  },
  success: '#7AE582',
  warning: '#FFC53D',
  danger: '#FF5C5C',
  info: '#4FC3F7',
  /** Acentos de dado — todos ≥ 6.5:1 sobre `neutral.950`, legíveis como rótulo. */
  accent: { pr: '#FFC53D', volume: '#D2FF3A', streak: '#FF7A2F', series: '#A78BFA', rest: '#4FC3F7' },
} as const;

/** Ordem de série para gráficos com N linhas — já testada contra o fundo escuro. */
export const dataSeries = [
  palette.accent.volume,
  palette.accent.series,
  palette.accent.pr,
  palette.info,
  palette.accent.streak,
] as const;

export type ThemeColors = {
  bg: string;
  /** Card/superfície um degrau acima do fundo. */
  bgElevated: string;
  /** Preenchimento interno dentro de um card (input, linha de série). */
  bgSubtle: string;
  border: string;
  /** Borda de item selecionado/foco. */
  borderStrong: string;
  text: string;
  textSecondary: string;
  /** Rótulo, unidade, metadado — hierarquia mais baixa ainda legível. */
  textTertiary: string;
  textInverse: string;
  primary: string;
  /** Texto/ícone sobre `primary`. Sempre tinta escura — nunca branco. */
  primaryText: string;
  /** Lima como TEXTO (link, valor em destaque). Muda por tema. */
  accentText: string;
  /** Trilho de anel/barra de progresso. */
  track: string;
  danger: string;
  warning: string;
  success: string;
};

export const lightTheme: ThemeColors = {
  bg: palette.neutral[50],
  bgElevated: palette.neutral[0],
  bgSubtle: palette.neutral[100],
  border: palette.neutral[200],
  borderStrong: palette.neutral[300],
  text: palette.neutral[900],
  textSecondary: palette.neutral[500],
  textTertiary: palette.neutral[400],
  textInverse: palette.neutral[0],
  primary: palette.brand[400],
  primaryText: palette.neutral[950],
  accentText: palette.brand[800], // 6.48:1 no branco — o único passo que passa
  track: palette.neutral[200],
  danger: '#D92D2D',
  warning: '#B77800',
  success: '#1F8A3B',
};

export const darkTheme: ThemeColors = {
  bg: palette.neutral[950],
  bgElevated: palette.neutral[900],
  bgSubtle: palette.neutral[800],
  border: palette.neutral[800],
  borderStrong: palette.neutral[700],
  text: palette.neutral[50],
  textSecondary: palette.neutral[300],
  textTertiary: palette.neutral[400],
  textInverse: palette.neutral[950],
  primary: palette.brand[400],
  primaryText: palette.neutral[950],
  accentText: palette.brand[400], // 17:1 no fundo escuro
  track: palette.neutral[800],
  danger: palette.danger,
  warning: palette.warning,
  success: palette.success,
};

/** Escala de 4pt */
export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48,
} as const;

/**
 * Raios generosos — a linguagem depende deles. Card a 20 e superfície de
 * destaque a 28 são o que diferencia "card" de "bloco".
 */
export const radius = {
  sm: 10, md: 14, lg: 20, xl: 28, '2xl': 36, full: 999,
} as const;

export const typography = {
  /** Números heróicos: contador de reps do player, saldo de volume. */
  metricXl: { fontSize: 56, fontWeight: '700', lineHeight: 60, letterSpacing: -1.5 },
  metric: { fontSize: 40, fontWeight: '700', lineHeight: 44, letterSpacing: -1 },
  display: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '500', lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  /** Rótulo de seção em caixa alta — usado acima de cada bloco do dashboard. */
  overline: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 1.2 },
} as const;

/** Alvos de toque — iOS HIG 44pt / Material 48dp */
export const layout = {
  screenPadding: spacing.lg,
  minTouchTarget: 44,
  ctaHeight: 56,
  listRowHeight: 56,
  tabBarHeight: 64,
  /** Botão central flutuante da tab bar. */
  fabSize: 56,
  /** Altura da imagem de capa em telas com herói. */
  heroHeight: 260,
} as const;

/** Anéis de progresso — o principal indicador visual do produto. */
export const ring = {
  sm: { size: 48, stroke: 5 },
  md: { size: 96, stroke: 8 },
  lg: { size: 160, stroke: 12 },
  /** Arco aberto (medidor), em graus. */
  gaugeSweep: 240,
} as const;

export const motion = {
  press: { duration: 100, scale: 0.97 },
  screen: 250,
  sheet: { damping: 20, stiffness: 180 },
  setCheck: { damping: 14, stiffness: 220 },
  ringFill: 700,
  celebration: 800,
  shimmer: 1200,
} as const;
