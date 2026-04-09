import { supabase } from '@/integrations/supabase/client';

export const queryUserUploads = async (options?: { orderBy?: string; limit?: number; includeUnapproved?: boolean }) => {
  const client = supabase as any;
  let query = client
    .from('user_uploads')
    .select('*') as any;

  // Only filter by approved status if not explicitly including unapproved
  if (!options?.includeUnapproved) {
    query = query.or(`status.eq.approved,status.is.null`); // Include null status (legacy data)
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query;
};

export const getTrendingBhajans = (period: string) => {
  const client = supabase as any;
  const now = new Date();
  let hours = 24;

  switch (period) {
    case 'hourly':
      hours = 1;
      break;
    case 'daily':
      hours = 24;
      break;
    case 'weekly':
      hours = 168;
      break;
    case 'all-time':
      return queryUserUploads({ orderBy: 'play_count', limit: 50 });
  }

  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return client
    .from('user_uploads')
    .select('*')
    .or(`status.eq.approved,status.is.null`)
    .gte('created_at', cutoff.toISOString())
    .order('play_count', { ascending: false });
};

export default queryUserUploads;
