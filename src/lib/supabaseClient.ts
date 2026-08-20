import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();

const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY ?? '', {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    lock: typeof window !== 'undefined' && 'navigator' in window && 'locks' in navigator
      ? undefined
      : async (_name, _acquireTimeout, fn) => fn(),
  },
});

export async function getAuthenticatedClient() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Authentication required. Please log in.');
  }
  return supabase;
}
