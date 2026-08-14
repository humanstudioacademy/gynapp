import { ActivityIndicator, Text, View } from 'react-native';

import { palette } from '@/theme/tokens';

/**
 * Cobre a tela enquanto a sessão é lida do SecureStore e o perfil chega.
 * Máximo de 1,5s na prática — depois disso o guard já decidiu o destino.
 */
export function BootSplash() {
  return (
    <View className="absolute inset-0 items-center justify-center gap-6 bg-neutral-950">
      <Text className="text-4xl font-bold text-brand-500">GymApp</Text>
      <ActivityIndicator color={palette.neutral[500]} />
    </View>
  );
}
