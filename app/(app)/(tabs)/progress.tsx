import { TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

/** Histórico, gráficos e recordes chegam na Fase 5. */
export default function ProgressScreen() {
  return (
    <Screen scroll={false}>
      <View className="py-4">
        <Text className="text-[28px] font-bold text-neutral-900 dark:text-neutral-50">
          Progresso
        </Text>
      </View>
      <View className="flex-1 justify-center">
        <EmptyState
          icon={TrendingUp}
          title="Nada para mostrar ainda"
          description="Seus gráficos, recordes e histórico aparecem aqui depois do primeiro treino registrado."
        />
      </View>
    </Screen>
  );
}
