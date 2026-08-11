import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

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

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  mfaAal: string | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string, phone_number?: string) => Promise<{ data: unknown; error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: unknown }>;
  resendEmailConfirmation: (email: string) => Promise<{ data: unknown; error: unknown }>;
  signInWithGoogle: (next?: string) => Promise<{ data: unknown; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<{ error: unknown }>;
  refreshMfaAssurance: () => Promise<void>;
};

const AUTH_CONTEXT_KEY = Symbol.for('app.auth_context');
const AuthContext: import('react').Context<AuthContextValue | null> = (globalThis as any)[AUTH_CONTEXT_KEY] || (() => {
  const ctx = createContext<AuthContextValue | null>(null);
  (globalThis as any)[AUTH_CONTEXT_KEY] = ctx;
  return ctx;
})();

const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

async function ensureUserProfile(authUser: User) {
  const client = supabase as any;
  const { data: existing, error: readError } = await client
    .from('user_profiles')
    .select('id')
    .eq('id', authUser.id)
    .maybeSingle();

  if (readError && readError.code !== 'PGRST116') {
    console.error('Profile lookup failed:', readError);
    return;
  }
  if (existing) return;

  const meta = authUser.user_metadata ?? {};
  const name =
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.full_name === 'string' && meta.full_name) ||
    authUser.email?.split('@')[0] ||
    'Devotee';

  const { error: insertError } = await client.from('user_profiles').insert({
    id: authUser.id,
    email: authUser.email || `${authUser.id}@user.local`,
    name,
    phone_number: typeof meta.phone_number === 'string' ? meta.phone_number : null,
  });

  if (insertError && insertError.code !== '23505') {
    console.error('Profile create failed:', insertError);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mfaAal, setMfaAal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const client = supabase as any;
      const { data, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        const isNetworkErr = profileError.message?.includes('Failed to fetch') || profileError.message?.includes('fetch');
        if (isNetworkErr) {
          console.warn('Profile fetch timed out / network offline, using fallback metadata');
        } else {
          console.error('Profile fetch error:', profileError);
        }

        // Fallback to local session metadata if network database query times out
        const sessionUser = (await supabase.auth.getUser().catch(() => ({ data: { user: null } }))).data?.user;
        if (sessionUser) {
          const meta = sessionUser.user_metadata ?? {};
          const name = meta.name || meta.full_name || sessionUser.email?.split('@')[0] || 'Devotee';
          setProfile({
            id: sessionUser.id,
            email: sessionUser.email || '',
            name,
            avatar_url: meta.avatar_url,
            created_at: sessionUser.created_at,
          });
        } else {
          setProfile(null);
        }
        return;
      }

      if (data) {
        setProfile(data);
        return;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (authUser) {
        await ensureUserProfile(authUser).catch(() => {});
        const { data: created } = await client
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
          .catch(() => ({ data: null }));

        if (created) {
          setProfile(created);
        } else {
          const meta = authUser.user_metadata ?? {};
          const name = meta.name || meta.full_name || authUser.email?.split('@')[0] || 'Devotee';
          setProfile({
            id: authUser.id,
            email: authUser.email || '',
            name,
            avatar_url: meta.avatar_url,
            created_at: authUser.created_at,
          });
        }
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      console.warn('Network timeout / connection issue during profile fetch:', err?.message || err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const clearBrokenAuth = async (reason: string) => {
      console.warn('Clearing broken auth session:', reason);
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
      try {
        const keys = Object.keys(localStorage).filter(
          (k) => k.startsWith('sb-') && k.includes('auth'),
        );
        for (const k of keys) localStorage.removeItem(k);
      } catch {
        // ignore
      }
      if (mounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        const msg = error.message || '';
        if (/refresh token/i.test(msg) || /session/i.test(msg)) {
          void clearBrokenAuth(msg);
          return;
        }
        console.warn('Session recovery failed, clearing stale auth data:', msg);
        void clearBrokenAuth(msg);
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (/refresh token/i.test(msg)) void clearBrokenAuth(msg);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setLoading(true);
        }
        void fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const refreshMfaAssurance = useCallback(async () => {
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
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, phone_number?: string) => {
      try {
        setError(null);
        const redirectTo =
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/upload-bhajan')}`
            : undefined;
        const { data, error: signUpError } = await supabase.auth.signUp({
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

        if (signUpError) {
          setError(signUpError.message);
          return { data, error: signUpError };
        }

        if (data.user) {
          await ensureUserProfile(data.user);
          if (data.session) {
            await fetchUserProfile(data.user.id);
          }
        }

        return { data, error: signUpError };
      } catch (err: any) {
        setError(err.message);
        return { data: null, error: err };
      }
    },
    [fetchUserProfile],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return { data, error: signInError };
        }

        if (data.user) {
          await ensureUserProfile(data.user);
          await fetchUserProfile(data.user.id);
        }

        return { data, error: signInError };
      } catch (err: any) {
        setError(err.message);
        return { data: null, error: err };
      }
    },
    [fetchUserProfile],
  );

  const resendEmailConfirmation = useCallback(async (email: string) => {
    try {
      setError(null);
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/upload-bhajan')}`
          : undefined;
      const { data, error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (resendError) setError(resendError.message);
      return { data, error: resendError };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  }, []);

  const signInWithGoogle = useCallback(async (next = '/upload-bhajan') => {
    try {
      setError(null);
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (oauthError) setError(oauthError.message);
      return { data, error: oauthError };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(signOutError.message);
      setProfile(null);
      return { error: signOutError };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: UserProfileUpdate) => {
      if (!user) {
        return { error: new Error('You must be logged in') };
      }

      try {
        setError(null);
        const client = supabase as any;

        const { data: updatedRow, error: updateError } = await client
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id)
          .select('id')
          .maybeSingle();

        if (updateError) {
          setError(updateError.message);
          return { error: updateError };
        }

        if (!updatedRow) {
          await ensureUserProfile(user);
          const { error: retryError } = await client.from('user_profiles').update(updates).eq('id', user.id);
          if (retryError) {
            setError(retryError.message);
            return { error: retryError };
          }
        }

        await fetchUserProfile(user.id);
        return { error: null };
      } catch (err: any) {
        setError(err.message);
        return { error: err };
      }
    },
    [fetchUserProfile, user],
  );

  const isAdmin = Boolean(profile?.role && ['moderator', 'admin', 'super_admin'].includes(profile.role));
  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (!user || !isAdmin) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        void supabase.auth.signOut();
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
    void refreshMfaAssurance();
  }, [user?.id, refreshMfaAssurance]);

  const value = useMemo<AuthContextValue>(
    () => ({
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
    }),
    [
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
