import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Cor de destaque quando selecionado (ex.: cor do grupo muscular). */
  tint?: string;
};

/** Chip de filtro rolável (docs/07, seção 3.1). Alvo de toque de 44pt. */
export function Chip({ label, selected, onPress, tint }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={selected && tint ? { backgroundColor: tint, borderColor: tint } : undefined}
      className={`h-11 justify-center rounded-full border px-4 ${
        selected
          ? 'border-brand-500 bg-brand-500'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <Text
        className={`text-[13px] font-medium ${
          selected ? 'text-neutral-950' : 'text-neutral-600 dark:text-neutral-300'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
