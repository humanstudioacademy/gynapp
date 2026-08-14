import { Pressable, Text, View } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Rótulo do grupo para leitores de tela. */
  label?: string;
};

/** Seletor de 2–4 opções (docs/07, seção 3.1). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      className="flex-row rounded-md bg-neutral-100 p-1 dark:bg-neutral-800"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            className={`h-10 flex-1 items-center justify-center rounded-sm ${
              selected ? 'bg-white dark:bg-neutral-950' : ''
            }`}
          >
            <Text
              className={`text-[15px] ${
                selected
                  ? 'font-semibold text-neutral-900 dark:text-neutral-50'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
