import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

const SLIDES = [
  {
    emoji: '📋',
    title: 'Seu treino, do seu jeito',
    description:
      'Monte sua rotina ou comece com uma das 5 prontas. 138 exercícios com instruções de execução.',
  },
  {
    emoji: '⏱',
    title: 'Registre sem perder o ritmo',
    description:
      'Uma batida para marcar a série. O timer de descanso começa sozinho e avisa quando acabar.',
  },
  {
    emoji: '📈',
    title: 'Veja a evolução acontecer',
    description: 'Gráficos de volume, recordes pessoais e histórico completo — tudo salvo na nuvem.',
  },
] as const;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View style={{ paddingTop: insets.top + 24 }} className="items-center">
        <Text className="text-3xl font-bold text-brand-800 dark:text-brand-400">GymApp</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width }} className="items-center justify-center px-8">
            <Text className="mb-8 text-7xl">{slide.emoji}</Text>
            <Text className="mb-3 text-center text-[28px] font-bold leading-9 text-neutral-900 dark:text-neutral-50">
              {slide.title}
            </Text>
            <Text className="text-center text-base leading-6 text-neutral-500 dark:text-neutral-400">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        accessibilityRole="tablist"
        accessibilityLabel={`Slide ${index + 1} de ${SLIDES.length}`}
        className="mb-8 flex-row justify-center gap-2"
      >
        {SLIDES.map((slide, i) => (
          <View
            key={slide.title}
            className={`h-2 rounded-full ${
              i === index ? 'w-6 bg-brand-400' : 'w-2 bg-neutral-300 dark:bg-neutral-700'
            }`}
          />
        ))}
      </View>

      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-3 px-4">
        <Button
          title="Criar conta"
          size="lg"
          fullWidth
          onPress={() => router.push('/sign-up')}
          testID="welcome-sign-up"
        />
        <Button
          title="Já tenho conta"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => router.push('/sign-in')}
          testID="welcome-sign-in"
        />
      </View>
    </View>
  );
}
