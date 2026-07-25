import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

let rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
if (!rawUrl || rawUrl.includes('yyhupdgktinpynmvmvrw')) {
  rawUrl = 'https://khnqyhzlrxwmolyevaqo.supabase.co';
}
const SUPABASE_URL = rawUrl;

const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in .env',
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY ?? '', {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
  },
});

export async function getAuthenticatedClient() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Authentication required. Please log in.');
  }
  return supabase;
}
