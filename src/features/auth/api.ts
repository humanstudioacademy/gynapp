import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase/client';

/** Deep links registrados no Dashboard do Supabase (docs/04, seção 1.6). */
export const AUTH_CALLBACK_URL = Linking.createURL('/auth/callback');
export const RESET_PASSWORD_URL = Linking.createURL('/auth/reset-password');

/** Mensagem por `error_code` do GoTrue — mais confiável que casar texto. */
const MESSAGE_BY_CODE: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
  user_already_exists: 'Já existe uma conta com esse e-mail. Tente entrar.',
  email_exists: 'Já existe uma conta com esse e-mail. Tente entrar.',
  email_address_invalid: 'Esse e-mail não parece válido. Confira o endereço.',
  email_address_not_authorized: 'Esse e-mail não está autorizado a criar conta.',
  weak_password: 'Senha fraca. Use pelo menos 8 caracteres, com letra e número.',
  same_password: 'A nova senha precisa ser diferente da anterior.',
  otp_expired: 'Esse link expirou. Peça um novo e-mail.',
  flow_state_expired: 'Esse link expirou. Peça um novo e-mail.',
  flow_state_not_found: 'Esse link já foi usado. Peça um novo e-mail.',
  bad_code_verifier: 'Abra o link no mesmo aparelho em que pediu o e-mail.',
  signup_disabled: 'Cadastro temporariamente indisponível. Tente mais tarde.',
  over_email_send_rate_limit: 'Muitos e-mails enviados. Aguarde alguns minutos.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde um minuto e tente de novo.',
  validation_failed: 'Confira os dados informados.',
};

/**
 * Traduz o erro do Supabase para linguagem humana em PT-BR.
 * Nunca vazar mensagem técnica para a UI (docs/07, seção 6).
 */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code && MESSAGE_BY_CODE[code]) return MESSAGE_BY_CODE[code];

  const raw = error instanceof Error ? error.message : String(error ?? '');
  const message = raw.toLowerCase();

  // Fallback por texto — cobre erros sem `error_code` (RPC, Storage, rede).
  if (message.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  }
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'Já existe uma conta com esse e-mail. Tente entrar.';
  }
  if (message.includes('is invalid') && message.includes('email')) {
    return 'Esse e-mail não parece válido. Confira o endereço.';
  }
  if (message.includes('password should be at least')) {
    return 'Sua senha precisa ter pelo menos 8 caracteres.';
  }
  if (message.includes('pwned') || message.includes('compromised')) {
    return 'Essa senha apareceu em vazamentos de dados. Escolha outra.';
  }
  if (message.includes('for security purposes') || message.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Não foi possível conectar. Verifique sua internet e tente de novo.';
  }
  if (message.includes('expired') || message.includes('code verifier')) {
    return 'Esse link expirou. Peça um novo e-mail.';
  }

  return 'Algo deu errado. Tente de novo em instantes.';
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** O trigger `handle_new_user` cria profiles + user_settings a partir do metadata. */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: AUTH_CALLBACK_URL,
    },
  });

  if (error) throw error;
  return { needsEmailConfirmation: data.session === null };
}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: AUTH_CALLBACK_URL },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: RESET_PASSWORD_URL,
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
