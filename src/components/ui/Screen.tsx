import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

/** Wrapper padrão de tela: safe area + padding de 16pt + fundo do tema. */
export function Screen({ children, scroll = true, padded = true }: Props) {
  const insets = useSafeAreaInsets();
  const Container = scroll ? ScrollView : View;

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <Container
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        contentContainerStyle={scroll ? { paddingBottom: insets.bottom + 24 } : undefined}
        className={padded ? 'px-4' : undefined}
      >
        {children}
      </Container>
    </View>
  );
}
