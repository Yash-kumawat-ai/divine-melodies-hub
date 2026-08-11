import { useState, useEffect } from 'react';
import data from '../data/liveAartis.json';
import type { Temple, AartiWithStatus } from '../types/liveAarti';
import { supabase } from '@/lib/supabaseClient';

export function getIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

export function parseISTTime(timeStr: string): Date {
  const ist = getIST();
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(ist);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getNextAarti(temple: Temple): {
  aarti: any;
  minutesUntilStart: number;
} | null {
  if (temple.aartiSchedule.length === 0) return null;

  const now = getIST();
  let nextAarti: any = null;
  let minDiff = Infinity;

  // Check today's aartis
  for (const aarti of temple.aartiSchedule) {
    const start = parseISTTime(aarti.time);
    const diff = (start.getTime() - now.getTime()) / 60000;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextAarti = { aarti, minutesUntilStart: Math.ceil(diff) };
    }
  }

  // If no aarti remains today, get the first one tomorrow
  if (!nextAarti) {
    const sorted = [...temple.aartiSchedule].sort((a, b) => a.time.localeCompare(b.time));
    const firstAarti = sorted[0];
    const startTomorrow = parseISTTime(firstAarti.time);
    startTomorrow.setDate(startTomorrow.getDate() + 1); // Tomorrow
    const diff = (startTomorrow.getTime() - now.getTime()) / 60000;
    nextAarti = { aarti: firstAarti, minutesUntilStart: Math.ceil(diff) };
  }

  return nextAarti;
}

export function formatVerifiedTime(lastVerifiedAt?: string, isHi?: boolean): string {
  if (!lastVerifiedAt) return '';
  const now = new Date();
  const verified = new Date(lastVerifiedAt);
  const diffSec = Math.floor((now.getTime() - verified.getTime()) / 1000);

  if (diffSec < 10) {
    return isHi ? 'अभी-अभी सत्यापित' : 'Verified just now';
  }
  if (diffSec < 60) {
    return isHi ? `${diffSec} सेकंड पहले सत्यापित` : `Verified ${diffSec}s ago`;
  }
  
  return isHi 
    ? `${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} पर सत्यापित`
    : `Verified at ${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

interface VerificationState {
  id?: string;
  status: 'LIVE' | 'UPCOMING' | 'OFFLINE' | 'STREAM_UNAVAILABLE';
  liveTitle: string | null;
  videoId: string | null;
  lastVerifiedAt: string;
}

export function useLiveAarti() {
  const [liveNow, setLiveNow] = useState<AartiWithStatus[]>([]);
  const [startingSoon, setStartingSoon] = useState<AartiWithStatus[]>([]);
  const [upcoming, setUpcoming] = useState<AartiWithStatus[]>([]);
  const [todaysTemples, setTodaysTemples] = useState<Temple[]>([]);
  const [allTemples, setAllTemples] = useState<Temple[]>(data.temples as Temple[]);
  const [verifiedStatuses, setVerifiedStatuses] = useState<Record<string, VerificationState>>({});
  // Page renders immediately from schedule JSON; live verification updates in background.
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

<<<<<<< HEAD
  // Helper to fetch live verification from Supabase Edge Function.
  // Works on any static host (Hostinger, Netlify, Cloudflare Pages, etc.)
  // because it does NOT rely on the Vite dev-server middleware.
  const SUPABASE_EDGE_URL = 'https://khnqyhzlrxwmolyevaqo.supabase.co/functions/v1/live-aarti-check';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  const fetchLiveStatus = async (templeId: string): Promise<VerificationState> => {
    try {
      const res = await fetch(`${SUPABASE_EDGE_URL}?templeId=${templeId}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`Edge function returned ${res.status}`);
      return await res.json();
=======
  // Hostinger is static — call Supabase Edge Function (DB-cached YouTube checks).
  const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
  const SUPABASE_ANON_KEY =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

  const fallbackStatus = (templeId: string): VerificationState => {
    const temple = data.temples.find(t => t.id === templeId);
    const hasSchedule = temple ? temple.aartiSchedule.length > 0 : false;
    return {
      id: templeId,
      status: hasSchedule ? 'UPCOMING' : 'OFFLINE',
      liveTitle: null,
      videoId: null,
      lastVerifiedAt: new Date().toISOString(),
    };
  };

  /** Prefer instant DB cache, then Edge Function (may refresh YouTube in background). */
  const fetchAllLiveStatuses = async (): Promise<Record<string, VerificationState>> => {
    const out: Record<string, VerificationState> = {};
    for (const temple of data.temples) {
      out[temple.id] = fallbackStatus(temple.id);
    }

    // 1) Instant path: read cached rows from Supabase (RLS allows public SELECT)
    try {
      const { data: rows, error } = await supabase
        .from('live_aarti_status')
        .select('temple_id, status, live_title, video_id, last_verified_at');
      if (!error && rows?.length) {
        for (const row of rows) {
          const id = row.temple_id as string;
          if (!out[id]) continue;
          out[id] = {
            id,
            status: row.status,
            liveTitle: row.live_title ?? null,
            videoId: row.video_id ?? null,
            lastVerifiedAt: row.last_verified_at ?? new Date().toISOString(),
          };
        }
      }
>>>>>>> featur
    } catch (err) {
      console.warn('DB live status read failed, continuing to Edge Function', err);
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Missing VITE_SUPABASE_URL or anon/publishable key — live status unavailable');
      return out;
    }

    // 2) Edge Function: returns cache immediately + refreshes stale in background
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/live-aarti-check`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`Edge function returned ${res.status}`);

      const body = await res.json();

      if (body?.statuses && typeof body.statuses === 'object') {
        for (const temple of data.temples) {
          const row = body.statuses[temple.id];
          if (row?.status) {
            out[temple.id] = {
              id: temple.id,
              status: row.status,
              liveTitle: row.liveTitle ?? null,
              videoId: row.videoId ?? null,
              lastVerifiedAt: row.lastVerifiedAt ?? new Date().toISOString(),
            };
          }
        }
        return out;
      }

      if (body?.status && body?.id) {
        out[body.id] = {
          id: body.id,
          status: body.status,
          liveTitle: body.liveTitle ?? null,
          videoId: body.videoId ?? null,
          lastVerifiedAt: body.lastVerifiedAt ?? new Date().toISOString(),
        };
      }
      return out;
    } catch (err) {
      console.warn('Could not verify live statuses via Edge Function; using DB/schedule fallback', err);
      return out;
    }
  };

  /** Apply status map into page sections without blocking first paint. */
  function applyStatuses(newStatuses: Record<string, VerificationState>) {
    const now = getIST();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });

    setVerifiedStatuses(newStatuses);

    const templesWithStatus = (data.temples as Temple[]).map(temple => {
      const verified = newStatuses[temple.id] || {
        status: temple.aartiSchedule.length > 0 ? 'UPCOMING' : 'OFFLINE',
        liveTitle: null,
        videoId: null,
        lastVerifiedAt: new Date().toISOString()
      };
      return {
        ...temple,
        status: verified.status,
        videoId: verified.videoId,
        liveTitle: verified.liveTitle,
        lastVerifiedAt: verified.lastVerifiedAt
      };
    });
    setAllTemples(templesWithStatus);

    const auspiciousIds = (data.weeklyAuspiciousMapping as Record<string, string[]>)[dayName] ?? [];
    const auspicious = templesWithStatus
      .filter(t => auspiciousIds.includes(t.id) && !t.requiresTitleFilter)
      .sort((a, b) => b.streamReliability - a.streamReliability);
    setTodaysTemples(auspicious);

    const live: AartiWithStatus[] = [];
    const soon: AartiWithStatus[] = [];
    const up: AartiWithStatus[] = [];

    for (const temple of templesWithStatus) {
      const verified = newStatuses[temple.id] || {
        status: temple.aartiSchedule.length > 0 ? 'UPCOMING' : 'OFFLINE',
        liveTitle: null,
        videoId: null,
        lastVerifiedAt: new Date().toISOString()
      };

      if (verified.status === 'LIVE') {
        const matchingAarti = temple.aartiSchedule.find(a => {
          const start = parseISTTime(a.time);
          const end = new Date(start.getTime() + a.durationMinutes * 60000);
          return now >= start && now < end;
        }) || {
          name: verified.liveTitle || temple.deity + ' Live Darshan',
          nameHindi: verified.liveTitle || temple.deityHindi + ' लाइव दर्शन',
          time: now.toTimeString().slice(0, 5),
          durationMinutes: 60
        };

        live.push({
          temple,
          aarti: matchingAarti,
          status: 'live',
          minutesUntilStart: 0,
          minutesUntilEnd: 60,
          videoId: verified.videoId || undefined,
          liveTitle: verified.liveTitle || undefined,
          lastVerifiedAt: verified.lastVerifiedAt
        });
      }

      if (verified.status === 'LIVE' || verified.status === 'STREAM_UNAVAILABLE') continue;
      if (temple.requiresTitleFilter && temple.aartiSchedule.length === 0) continue;

      for (const aarti of temple.aartiSchedule) {
        const start = parseISTTime(aarti.time);
        const end = new Date(start.getTime() + aarti.durationMinutes * 60000);
        const diffStart = (start.getTime() - now.getTime()) / 60000;
        const diffEnd = (end.getTime() - now.getTime()) / 60000;

        if (diffStart > 0 && diffStart <= 30) {
          soon.push({ temple, aarti, status: 'starting-soon', minutesUntilStart: Math.ceil(diffStart) });
        } else if (diffStart > 30 && diffStart <= 180) {
          up.push({ temple, aarti, status: 'upcoming', minutesUntilStart: Math.ceil(diffStart) });
        }
      }
    }

    const sortByReliability = (a: AartiWithStatus, b: AartiWithStatus) =>
      b.temple.streamReliability - a.temple.streamReliability;

    setLiveNow(live.sort(sortByReliability));
    setStartingSoon(soon.sort((a, b) => a.minutesUntilStart - b.minutesUntilStart));
    setUpcoming(up.sort((a, b) => a.minutesUntilStart - b.minutesUntilStart).slice(0, 8));
  }

  async function compute(options?: { background?: boolean }) {
    if (!options?.background) setIsVerifying(true);

    // Instant: DB cache → paint LIVE ASAP, then Edge Function may refine.
    try {
      const { data: rows } = await supabase
        .from('live_aarti_status')
        .select('temple_id, status, live_title, video_id, last_verified_at');
      if (rows?.length) {
        const quick: Record<string, VerificationState> = {};
        for (const temple of data.temples) quick[temple.id] = fallbackStatus(temple.id);
        for (const row of rows) {
          const id = row.temple_id as string;
          if (!quick[id]) continue;
          quick[id] = {
            id,
            status: row.status,
            liveTitle: row.live_title ?? null,
            videoId: row.video_id ?? null,
            lastVerifiedAt: row.last_verified_at ?? new Date().toISOString(),
          };
        }
        applyStatuses(quick);
      }
    } catch {
      // ignore — Edge Function path below still runs
    }

    const newStatuses = await fetchAllLiveStatuses();
    applyStatuses(newStatuses);
    setIsVerifying(false);
  }

  useEffect(() => {
    // Paint schedule UI first, then verify live streams.
    const bootstrap = () => {
      const now = getIST();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
      const seeded = (data.temples as Temple[]).map((temple) => ({
        ...temple,
        status: (temple.aartiSchedule.length > 0 ? 'UPCOMING' : 'OFFLINE') as Temple['status'],
        videoId: null,
        liveTitle: null,
        lastVerifiedAt: undefined,
      }));
      setAllTemples(seeded);
      const auspiciousIds = (data.weeklyAuspiciousMapping as Record<string, string[]>)[dayName] ?? [];
      setTodaysTemples(
        seeded
          .filter((t) => auspiciousIds.includes(t.id) && !t.requiresTitleFilter)
          .sort((a, b) => b.streamReliability - a.streamReliability),
      );
    };
    bootstrap();
    void compute();
    const interval = setInterval(() => void compute({ background: true }), 60000);
    return () => clearInterval(interval);
  }, []);

  return { 
    liveNow, 
    startingSoon, 
    upcoming, 
    todaysTemples, 
    allTemples,
    verifiedStatuses,
    isLoading,
    isVerifying,
  };
}
