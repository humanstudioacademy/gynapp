// Edge Function `delete-account` — exclusão de conta com garantia no servidor.
//
// O app já consegue fazer o mesmo pelo cliente (limpa o Storage e chama a RPC
// `delete_my_account`), mas ali a limpeza depende do dispositivo terminar o
// trabalho. Aqui a operação é atômica do ponto de vista do usuário: se o app
// morrer no meio, o servidor já terminou.
//
// Deploy:
//   supabase functions deploy delete-account --project-ref <ref>
// Não precisa de segredo extra: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já
// existem no ambiente das Edge Functions.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const USER_BUCKETS = ['avatars', 'progress-photos'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Identifica o chamador com o próprio token dele — nunca confiar num id vindo no body.
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await caller.auth.getUser();
  const userId = userData?.user?.id;
  if (userError || !userId) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceKey);

  // 1) Storage: o cascade de auth.users não alcança os buckets.
  for (const bucket of USER_BUCKETS) {
    const { data: files } = await admin.storage.from(bucket).list(userId);
    if (files?.length) {
      await admin.storage.from(bucket).remove(files.map((file) => `${userId}/${file.name}`));
    }
  }

  // 2) auth.users: o delete cascateia profiles e todo o resto do schema.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return json({ error: 'delete_failed' }, 500);

  return json({ ok: true });
});
