import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

/**
 * Reordenação por botões em vez de arrastar.
 *
 * Arrastar exige `react-native-draggable-flatlist`, que ainda não acompanha o
 * Reanimated 4 desta versão do SDK. Mais importante: arrastar é inalcançável
 * para quem usa VoiceOver/TalkBack — os botões cobrem os dois casos. Voltar a
 * oferecer o arrasto por cima disso é item de polimento da Fase 7.
 */
export function ReorderControls({
  label,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="items-center">
      <Pressable
        onPress={onMoveUp}
        disabled={!canMoveUp}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={`Mover ${label} para cima`}
        accessibilityState={{ disabled: !canMoveUp }}
        className={`h-8 w-11 items-center justify-center ${canMoveUp ? '' : 'opacity-25'}`}
      >
        <ChevronUp size={20} color={colors.textSecondary} />
      </Pressable>
      <Pressable
        onPress={onMoveDown}
        disabled={!canMoveDown}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={`Mover ${label} para baixo`}
        accessibilityState={{ disabled: !canMoveDown }}
        className={`h-8 w-11 items-center justify-center ${canMoveDown ? '' : 'opacity-25'}`}
      >
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}
