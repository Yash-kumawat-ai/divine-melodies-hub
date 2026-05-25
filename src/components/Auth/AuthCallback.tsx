import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/upload-bhajan';
  }
  return value;
}

export default function AuthCallback() {
  const [message, setMessage] = useState('Completing Google sign in...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const completeAuth = async () => {
      const next = getSafeNext(searchParams.get('next'));
      const code = searchParams.get('code');

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          navigate(next, { replace: true });
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          navigate(next, { replace: true });
          return;
        }

        navigate('/auth/login', { replace: true });
      } catch (error) {
        console.error('Google auth callback failed:', error);
        if (mounted) {
          setMessage('Google sign in failed. Please try again.');
        }
        window.setTimeout(() => navigate('/auth/login', { replace: true }), 1800);
      }
    };

    completeAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
