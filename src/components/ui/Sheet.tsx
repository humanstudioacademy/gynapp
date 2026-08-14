import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Bottom sheet para escolhas rápidas (docs/05, seção 4 — navegação). */
export function Sheet({ visible, onClose, title, children }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        className="flex-1 bg-neutral-950/60"
      />
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="rounded-t-xl border-t border-neutral-200 bg-white px-4 pt-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {title}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="h-11 w-11 items-center justify-center"
          >
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}
