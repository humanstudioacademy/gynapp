import { colorScheme } from 'nativewind';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type ThemeColors } from './tokens';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  /** Preferência do usuário (user_settings.theme). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  // Padrão do produto é escuro (docs/07, seção 8): sem preferência explícita
  // e sem sistema em claro, usa dark.
  const isDark = preference === 'system' ? systemScheme !== 'light' : preference === 'dark';

  // Mantém as classes `dark:` do NativeWind em sincronia com a preferência.
  useEffect(() => {
    try {
      colorScheme.set(isDark ? 'dark' : 'light');
    } catch {
      // Na web em desenvolvimento o NativeWind lê o flag `darkMode` do CSS, que o
      // Expo injeta depois deste módulo carregar — nessa janela o set() lança.
      // Alternar a classe no <html> tem exatamente o mesmo efeito (o CSS é gerado
      // com `darkMode: 'class'`) e o runtime se realinha quando o flag chega.
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
      }
    }
  }, [isDark]);

  const handleSetPreference = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkTheme : lightTheme,
      isDark,
      preference,
      setPreference: handleSetPreference,
    }),
    [isDark, preference, handleSetPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
