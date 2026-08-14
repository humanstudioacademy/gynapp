import { Text, View } from 'react-native';

import { Button } from './Button';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  title: string;
  /** Deixe a consequência explícita (docs/07, seção 6). */
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmação de ação destrutiva.
 * Não usamos `Alert.alert`: ele é no-op no React Native Web, o que deixaria o
 * botão sem efeito nenhum fora do celular — e sem como verificar o fluxo.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Sheet visible={visible} onClose={onCancel} title={title}>
      <View className="gap-4">
        <Text className="text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
          {message}
        </Text>
        <View className="gap-2">
          <Button
            title={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            size="lg"
            fullWidth
            loading={loading}
            onPress={onConfirm}
            testID="confirm-dialog-confirm"
          />
          <Button
            title={cancelLabel}
            variant="secondary"
            size="lg"
            fullWidth
            disabled={loading}
            onPress={onCancel}
          />
        </View>
      </View>
    </Sheet>
  );
}
