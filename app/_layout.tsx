import '../global.css';
import '@/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootSplash } from '@/components/ui/BootSplash';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useAuthGuard } from '@/features/auth/useAuthGuard';
import { useProfile } from '@/features/profile/hooks';
import { queryClient } from '@/lib/query/client';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useThemeSync } from '@/theme/useThemeSync';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <RootNavigator />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { isDark } = useTheme();
  const { session, isLoading } = useAuth();
  const profile = useProfile();

  useThemeSync();
  useAuthGuard();

  // Só sai do splash quando dá para decidir o destino: sessão lida e,
  // se houver sessão, perfil carregado (é ele que diz se falta onboarding).
  const booting = isLoading || (session !== null && profile.isPending);

  useEffect(() => {
    if (!booting) void SplashScreen.hideAsync();
  }, [booting]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      {booting ? <BootSplash /> : null}
    </>
  );
}
