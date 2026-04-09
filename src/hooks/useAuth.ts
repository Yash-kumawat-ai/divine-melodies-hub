import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

type UserProfileUpdate = Partial<Pick<UserProfile, 'name' | 'avatar_url'>>;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        setError(error.message);
        return { data, error };
      }

      // Create user profile
      if (data.user) {
        const client = supabase as any;
        const { error: profileError } = await client.from('user_profiles').insert([
          {
            id: data.user.id,
            email,
            name,
          },
        ]);

        if (profileError) {
          console.log('Profile creation error:', profileError);
          setError(profileError.message);
          return { data: null, error: profileError };
        }
      }

      return { data, error };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

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

  return { user, profile, loading, error, signUp, signIn, signOut, fetchUserProfile, updateProfile };
}
