import { router } from 'expo-router';
import { BookOpen, Dumbbell } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/ThemeProvider';

/** Rotinas, fichas e templates chegam na Fase 3. A biblioteca já está de pé. */
export default function WorkoutsScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll={false}>
      <View className="flex-row items-center justify-between py-4">
        <Text className="text-[28px] font-bold text-neutral-900 dark:text-neutral-50">Treinos</Text>
        <Pressable
          onPress={() => router.push('/exercise/library')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Abrir biblioteca de exercícios"
          className="h-11 w-11 items-center justify-center"
        >
          <BookOpen size={22} color={colors.text} />
        </Pressable>
      </View>

      <Card className="p-0">
        <ListRow
          icon={BookOpen}
          title="Biblioteca de exercícios"
          subtitle="138 exercícios com instruções de execução"
          onPress={() => router.push('/exercise/library')}
        />
      </Card>

      <View className="flex-1 justify-center">
        <EmptyState
          icon={Dumbbell}
          title="Você ainda não tem rotinas"
          description="Em breve dá para montar a sua ou começar com uma das 5 rotinas prontas."
        />
      </View>
    </Screen>
  );
}
