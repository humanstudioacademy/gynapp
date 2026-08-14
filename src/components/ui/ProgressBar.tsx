import { View } from 'react-native';

type Props = {
  /** 0 a 1. */
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: Props) {
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
    >
      <View style={{ width: `${clamped * 100}%` }} className="h-full rounded-full bg-brand-500" />
    </View>
  );
}
