import { supabase } from '@/lib/supabase/client';

const USER_BUCKETS = ['avatars', 'progress-photos'] as const;

/**
 * Remove os arquivos do usuário no Storage. O `delete` de `auth.users` cascateia
 * as tabelas, mas **não** apaga objetos do Storage — por isso a limpeza é explícita.
 * As policies de Storage já permitem que o dono apague a própria pasta.
 */
async function removeOwnStorage(userId: string): Promise<void> {
  for (const bucket of USER_BUCKETS) {
    const { data, error } = await supabase.storage.from(bucket).list(userId);
    if (error || !data?.length) continue;

    const paths = data.map((file) => `${userId}/${file.name}`);
    await supabase.storage.from(bucket).remove(paths);
  }
}

/**
 * Exclusão de conta in-app — exigência da Apple (Guideline 5.1.1(v)) e da LGPD.
 * Apaga arquivos, chama `delete_my_account()` (que remove o usuário de auth.users
 * e cascateia todas as tabelas) e encerra a sessão local.
 */
export async function deleteAccount(): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  await removeOwnStorage(userId);

  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;

  await supabase.auth.signOut();
}
