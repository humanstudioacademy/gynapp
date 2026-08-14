import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useId, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = Omit<TextInputProps, 'placeholderTextColor'> & {
  label?: string;
  error?: string;
  hint?: string;
  /** Campo de senha: adiciona o botão de mostrar/ocultar. */
  secure?: boolean;
};

/**
 * Campo de texto do design system (docs/07, seção 3.1).
 * O erro é anunciado pelo leitor de tela junto do label — requisito de acessibilidade.
 */
export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, secure = false, editable = true, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputId = useId();

  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-brand-500'
      : 'border-neutral-200 dark:border-neutral-800';

  return (
    <View className="gap-1.5">
      {label ? (
        <Text
          nativeID={inputId}
          className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400"
        >
          {label}
        </Text>
      ) : null}

      <View
        className={`h-12 flex-row items-center rounded-md border bg-white px-3 dark:bg-neutral-900 ${borderClass} ${editable ? '' : 'opacity-50'}`}
      >
        <TextInput
          ref={ref}
          editable={editable}
          secureTextEntry={secure && !revealed}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabelledBy={label ? inputId : undefined}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          className="h-12 flex-1 text-base text-neutral-900 dark:text-neutral-50"
          {...rest}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            className="pl-2"
          >
            {revealed ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text accessibilityRole="alert" className="text-[13px] text-danger">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{hint}</Text>
      ) : null}
    </View>
  );
});
