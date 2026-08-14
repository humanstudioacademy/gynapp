import { Switch as RNSwitch } from 'react-native';

import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Switch({ value, onValueChange, label, disabled = false }: Props) {
  const { isDark } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      trackColor={{
        false: isDark ? palette.neutral[700] : palette.neutral[300],
        true: palette.brand[500],
      }}
      thumbColor={palette.neutral[0]}
    />
  );
}
