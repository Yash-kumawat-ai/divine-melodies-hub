import { supabase } from '@/integrations/supabase/client';
import type { BirthProfileInput, BirthProfile, AstrologyProfile } from './types';

/**
 * Save user birth profile through authenticated Edge Function
 */
export async function saveBirthProfile(input: BirthProfileInput, options?: { forceReenqueue?: boolean }) {
  const { data, error } = await supabase.functions.invoke('save-birth-profile', {
    body: {
      ...input,
      force_reenqueue: Boolean(options?.forceReenqueue),
    },
  });

  if (error) {
    let msg = error.message;
    try {
      if ('context' in error && error.context && typeof (error.context as any).json === 'function') {
        const body = await (error.context as any).json();
        if (body?.error) msg = body.error;
      }
    } catch {}
    throw new Error(msg || 'Failed to save birth profile');
  }

  return data;
}

/**
 * Read astrology/birth rows with the stored session JWT.
 */
export async function getAstrologyProfile(userId: string): Promise<AstrologyProfile | null> {
  const { data, error } = await supabase
    .from('astrology_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading astrology profile:', error);
    return null;
  }

  return data as AstrologyProfile | null;
}

export async function getBirthProfile(userId: string): Promise<BirthProfile | null> {
  const { data, error } = await supabase
    .from('astrology_birth_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading birth profile:', error);
    return null;
  }

  return data as BirthProfile | null;
}
