import { CloudOff } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { Button } from './Button';

type Props = {
  /** Mensagem em linguagem humana. Nunca expor erro técnico (docs/07, seção 6). */
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Não foi possível carregar. Verifique sua internet e tente de novo.',
  onRetry,
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="items-center gap-3 px-6 py-12">
      <CloudOff size={40} color={colors.textSecondary} strokeWidth={1.5} />
      <Text className="text-center text-[15px] text-neutral-500 dark:text-neutral-400">
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-1">
          <Button title="Tentar novamente" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
