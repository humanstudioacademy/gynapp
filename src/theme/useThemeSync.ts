import { useEffect } from 'react';

import { useSettings } from '@/features/profile/hooks';

import { useTheme } from './ThemeProvider';

/**
 * Aplica `user_settings.theme` ao ThemeProvider assim que as preferências chegam.
 * A preferência do usuário sobrescreve a do sistema (docs/07, seção 8).
 */
export function useThemeSync() {
  const { data: settings } = useSettings();
  const { setPreference } = useTheme();
  const theme = settings?.theme;

  useEffect(() => {
    if (theme) setPreference(theme);
  }, [theme, setPreference]);
}
