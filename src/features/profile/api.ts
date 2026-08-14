import { File } from 'expo-file-system';

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

const AVATAR_BUCKET = 'avatars';

/** RLS já restringe ao próprio usuário — não precisa filtrar por id no cliente. */
export async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchSettings(): Promise<UserSettings | null> {
  const { data, error } = await supabase.from('user_settings').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch: ProfileUpdate): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSettings(patch: UserSettingsUpdate): Promise<UserSettings> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  const { data, error } = await supabase
    .from('user_settings')
    .update(patch)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** URL pública do avatar. O bucket é público; o caminho é `<uid>/<arquivo>`. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Envia o avatar para `avatars/<uid>/avatar-<timestamp>.<ext>` e grava o caminho no perfil.
 * O nome muda a cada upload para furar o cache de imagem do dispositivo.
 */
export async function uploadAvatar(localUri: string): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  const extension = (localUri.split('.').pop() ?? 'jpg').toLowerCase().split('?')[0] ?? 'jpg';
  const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const bytes = await new File(localUri).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, bytes, { contentType, upsert: true });

  if (uploadError) throw uploadError;

  return updateProfile({ avatar_path: path });
}
