import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  testID?: string;
};

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand-400',
  secondary: 'bg-neutral-200 dark:bg-neutral-800',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const textClass: Record<Variant, string> = {
  primary: 'text-neutral-950',
  secondary: 'text-neutral-900 dark:text-neutral-50',
  ghost: 'text-brand-800 dark:text-brand-400',
  danger: 'text-white',
};

// Altura mínima de 44pt (iOS HIG); CTA principal em 56pt (size="lg").
const sizeClass: Record<Size, string> = {
  sm: 'h-11 px-4',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  testID,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (haptic && Platform.OS !== 'web') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      // Escala no toque via callback do Pressable — evita mutar shared value
      // do Reanimated fora de worklet (regra react-hooks/immutability).
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
      className={`flex-row items-center justify-center gap-2 rounded-md ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text className={`text-base font-semibold ${textClass[variant]}`}>{title}</Text>
      )}
    </Pressable>
  );
}
