import type { ExpoConfig } from 'expo/config';

const ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
  | 'development'
  | 'preview'
  | 'production';

// ⚠️ O bundle ID NÃO pode ser alterado depois da primeira publicação nas lojas.
// Derivado do domínio the-human.ai (hífen removido: package Android não aceita).
// Trocar aqui antes do primeiro `eas submit` se for usar outro domínio.
const BASE_ID = 'ai.thehuman.gymapp';

const variants = {
  development: { name: 'GymApp (Dev)', id: `${BASE_ID}.dev` },
  preview: { name: 'GymApp (Beta)', id: `${BASE_ID}.preview` },
  production: { name: 'GymApp', id: BASE_ID },
} as const;

const variant = variants[ENV] ?? variants.development;

const config: ExpoConfig = {
  name: variant.name,
  slug: 'gymapp',
  scheme: 'gymapp',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: variant.id,
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        'Usamos a câmera para você registrar suas fotos de progresso e sua foto de perfil.',
      NSPhotoLibraryUsageDescription:
        'Permite escolher fotos de progresso e sua foto de perfil da galeria.',
    },
  },
  android: {
    package: variant.id,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0B0B0F',
    },
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'POST_NOTIFICATIONS', 'VIBRATE'],
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-font',
    [
      'expo-splash-screen',
      { backgroundColor: '#0B0B0F', image: './assets/images/splash.png', imageWidth: 180 },
    ],
    [
      'expo-notifications',
      { icon: './assets/images/notification-icon.png', color: '#22C55E' },
    ],
    [
      'expo-image-picker',
      { photosPermission: 'Permite escolher fotos de progresso da sua galeria.' },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    appEnv: ENV,
    // Projeto no EAS. Com app.config.ts (config dinâmico) o `eas init` não
    // escreve sozinho — o id fica aqui à mão, que é o que ele faria.
    eas: { projectId: 'a63012c7-6e29-44c8-9083-32c3eb8d0d3f' },
  },
};

export default config;
