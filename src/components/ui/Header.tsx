import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title?: string;
  /** Esconde o botão voltar (telas raiz de aba). */
  hideBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
};

/** Header de 56pt: voltar à esquerda, título ao centro, ação à direita (docs/07, seção 4). */
export function Header({ title, hideBack = false, onBack, right }: Props) {
  const { colors } = useTheme();
  const canGoBack = !hideBack;

  return (
    <View className="h-14 flex-row items-center px-1">
      <View className="w-12 items-start">
        {canGoBack ? (
          <Pressable
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : null))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="h-11 w-11 items-center justify-center"
          >
            <ChevronLeft size={26} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        className="flex-1 text-center text-[17px] font-semibold text-neutral-900 dark:text-neutral-50"
      >
        {title}
      </Text>

      <View className="w-12 items-end pr-1">{right}</View>
    </View>
  );
}
