import { useState, useEffect } from 'react';
import data from '../data/liveAartis.json';
import type { Temple, AartiWithStatus } from '../types/liveAarti';

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
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (err) {
      console.warn(`Could not verify live status for ${templeId}, falling back to offline/schedule`, err);
      // Fallback: never show LIVE. Show UPCOMING if has schedule, otherwise OFFLINE.
      const temple = data.temples.find(t => t.id === templeId);
      const hasSchedule = temple ? temple.aartiSchedule.length > 0 : false;
      return {
        status: hasSchedule ? 'UPCOMING' : 'OFFLINE',
        liveTitle: null,
        videoId: null,
        lastVerifiedAt: new Date().toISOString()
      };
    }
  };

  async function compute() {
    const now = getIST();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });

    // Fetch live status in parallel for all temples from server check endpoint
    const statusPromises = data.temples.map(async (temple) => {
      const status = await fetchLiveStatus(temple.id);
      return { id: temple.id, data: status };
    });

    const statusResults = await Promise.all(statusPromises);
    const newStatuses: Record<string, VerificationState> = {};
    for (const res of statusResults) {
      newStatuses[res.id] = res.data;
    }
    setVerifiedStatuses(newStatuses);
    setIsLoading(false);

    // Create a complete list of temples with their live statuses merged
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

    // Today's auspicious temples (exclude mixed-content channels)
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

      // If actually live, push to live section
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

      // Check scheduled items for starting soon or upcoming
      // Skip if the channel is currently verified as LIVE or STREAM_UNAVAILABLE or if it requires filtering
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

  useEffect(() => {
    compute();
    const interval = setInterval(compute, 60000);
    return () => clearInterval(interval);
  }, []);

  return { 
    liveNow, 
    startingSoon, 
    upcoming, 
    todaysTemples, 
    allTemples,
    verifiedStatuses,
    isLoading
  };
}
