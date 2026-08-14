import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam EXPO_PUBLIC_SUPABASE_URL e/ou EXPO_PUBLIC_SUPABASE_ANON_KEY. Copie .env.example para .env.',
  );
}

/**
 * Tokens ficam no Keychain (iOS) / EncryptedSharedPreferences (Android).
 * Nunca em AsyncStorage — ver docs/04-seguranca-rls-e-auth.md.
 */
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // obrigatório em React Native
    // PKCE: os links de e-mail chegam por deep link com `?code=`, trocado
    // por sessão em app/auth/* (docs/04, seção 1.1).
    flowType: 'pkce',
  },
});

// Só renova o token com o app em primeiro plano — economiza bateria.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') void supabase.auth.startAutoRefresh();
    else void supabase.auth.stopAutoRefresh();
  });
}
