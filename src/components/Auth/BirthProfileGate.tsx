import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBirthProfile } from '@/lib/astrology/astrologyClient';
import { completeProfileUrl } from '@/lib/astrology/completeProfileRedirect';

function cacheKey(userId: string) {
  return `raghavam_birth_ready_${userId}`;
}

export default function BirthProfileGate() {
  const { user, loading } = useAuth();
  const { pathname, search } = useLocation();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (loading || !user) {
        setMissing(false);
        return;
      }
      if (sessionStorage.getItem(cacheKey(user.id)) === '1') {
        setMissing(false);
        return;
      }
      try {
        const birth = await getBirthProfile(user.id);
        if (cancelled) return;
        if (birth?.date_of_birth) {
          sessionStorage.setItem(cacheKey(user.id), '1');
          setMissing(false);
        } else {
          setMissing(true);
        }
      } catch {
        if (!cancelled) setMissing(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [user, loading, pathname]);

  if (!missing || !user) return null;
  const next = `${pathname}${search || ''}` || '/';
  return <Navigate to={completeProfileUrl(next === '/auth/complete-profile' ? '/' : next)} replace />;
}

export function markBirthProfileReady(userId: string) {
  try {
    sessionStorage.setItem(cacheKey(userId), '1');
  } catch {
    /* ignore */
  }
}
