import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';

const ITEMS = [
  {
    title: 'O que guardamos',
    body: 'Seu e-mail, os dados de perfil que você preencher, seus treinos, medidas e fotos de progresso.',
  },
  {
    title: 'Quem enxerga',
    body: 'Só você. Todas as tabelas têm Row Level Security e suas fotos de progresso ficam em um bucket privado.',
  },
  {
    title: 'Nada de anúncios',
    body: 'Não vendemos nem compartilhamos seus dados. Não há rastreadores de publicidade no app.',
  },
  {
    title: 'Você manda',
    body: 'Dá para excluir a conta a qualquer momento em Configurações › Conta. A exclusão apaga tudo, sem cópia guardada.',
  },
] as const;

export default function PrivacyScreen() {
  return (
    <Screen>
      <Header title="Privacidade" />

      <View className="gap-4 py-2">
        {ITEMS.map((item) => (
          <Card key={item.title} className="gap-1.5">
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {item.title}
            </Text>
            <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
              {item.body}
            </Text>
          </Card>
        ))}

        <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
          A Política de Privacidade e os Termos de Uso completos são publicados em URL própria antes
          do beta (Fase 8), junto da exportação de dados em JSON (Fase 6).
        </Text>
      </View>
    </Screen>
  );
}
