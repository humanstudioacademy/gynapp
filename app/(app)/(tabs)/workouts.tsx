import { Dumbbell } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

/** Rotinas, fichas e templates chegam na Fase 3. */
export default function WorkoutsScreen() {
  return (
    <Screen scroll={false}>
      <View className="py-4">
        <Text className="text-[28px] font-bold text-neutral-900 dark:text-neutral-50">Treinos</Text>
      </View>
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
