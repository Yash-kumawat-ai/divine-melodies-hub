import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone_number?: string;
  role?: 'user' | 'moderator' | 'admin' | 'super_admin';
  mfa_enabled?: boolean;
  last_admin_activity_at?: string;
  created_at: string;
}

type UserProfileUpdate = Partial<Pick<UserProfile, 'name' | 'avatar_url' | 'phone_number'>>;

export function useAuth() {
  const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mfaAal, setMfaAal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const client = supabase as any;
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.log('Profile fetch error:', error);
        setProfile(null);
      } else if (data) {
        setProfile(data);
      } else {
        // No profile exists, set to null (this is fine)
        setProfile(null);
      }
    } catch (err) {
      console.log('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshMfaAssurance = async () => {
    try {
      const authAny = supabase.auth as any;
      if (!authAny?.mfa?.getAuthenticatorAssuranceLevel) {
        setMfaAal(null);
        return;
      }

      const { data } = await authAny.mfa.getAuthenticatorAssuranceLevel();
      setMfaAal(data?.currentLevel || null);
    } catch {
      setMfaAal(null);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone_number?: string) => {
    try {
      setError(null);
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/upload-bhajan')}`
          : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            name,
            full_name: name,
            phone_number: phone_number || null,
          },
        },
      });
      
      if (error) {
        setError(error.message);
        return { data, error };
      }

      return { data, error };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      return { data, error };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const resendEmailConfirmation = async (email: string) => {
    try {
      setError(null);
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/upload-bhajan')}`
          : undefined;
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) setError(error.message);
      return { data, error };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async (next = '/upload-bhajan') => {
    try {
      setError(null);
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) setError(error.message);
      return { data, error };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
      setProfile(null);
      return { error };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!user) {
      return { error: new Error('You must be logged in') };
    }

    try {
      setError(null);
      const { error } = await (supabase as any)
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setError(error.message);
        return { error };
      }

      await fetchUserProfile(user.id);
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const isAdmin = Boolean(profile?.role && ['moderator', 'admin', 'super_admin'].includes(profile.role));
  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (!user || !isAdmin) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        supabase.auth.signOut();
      }, ADMIN_IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) {
      setMfaAal(null);
      return;
    }
    refreshMfaAssurance();
  }, [user?.id]);

  return {
    user,
    profile,
    isAdmin,
    isSuperAdmin,
    mfaAal,
    loading,
    error,
    signUp,
    signIn,
    resendEmailConfirmation,
    signInWithGoogle,
    signOut,
    fetchUserProfile,
    updateProfile,
    refreshMfaAssurance,
  };
}
