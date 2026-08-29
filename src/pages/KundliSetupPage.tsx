import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Compass, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { saveBirthProfile, getBirthProfile, getAstrologyProfile } from '@/lib/astrology/astrologyClient';
import type { BirthProfileInput, AstrologyProfile } from '@/lib/astrology/types';
import { SEO } from '@/components/SEO';
import BirthDetailsWizard, { type BirthWizardInitial } from '@/components/astrology/BirthDetailsWizard';

type Phase = 'boot' | 'birth' | 'preparing';

const PREP_STEPS = [
  { key: 'planets_ready', hi: 'ग्रह स्थिति गणना', en: 'Planetary Positions' },
  { key: 'houses_ready', hi: 'भाव चक्र एवं लग्न', en: 'House Cusps & Lagna' },
  { key: 'dasha_ready', hi: 'दशा काल गणना', en: 'Dasha Timeline' },
  { key: 'predictions_ready', hi: 'जीवन संकेत', en: 'Astrological Indications' },
] as const;

const PREP_STALL_MS = 150_000;

function birthRowToInput(row: BirthWizardInitial & Record<string, unknown>): BirthProfileInput {
  return {
    date_of_birth: String(row.date_of_birth ?? ''),
    birth_time: (row.birth_time as string | null) || null,
    birth_time_accuracy: (row.birth_time_accuracy as BirthProfileInput['birth_time_accuracy']) || 'unknown',
    gender: (row.gender as BirthProfileInput['gender']) || 'unspecified',
    place_query: String(row.place_query ?? row.place_label ?? ''),
    place_label: String(row.place_label ?? row.place_query ?? ''),
    country_code: row.country_code as string | undefined,
    admin1: row.admin1 as string | undefined,
    lat: Number(row.lat),
    lng: Number(row.lng),
    timezone_iana: String(row.timezone_iana ?? 'Asia/Kolkata'),
    utc_offset_at_birth: String(row.utc_offset_at_birth ?? '+05:30'),
  };
}

export default function KundliSetupPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isHi = language === 'hi';
  const isEdit = params.get('edit') === '1';

  const [phase, setPhase] = useState<Phase>('boot');
  const [saving, setSaving] = useState(false);
  const [prepFlags, setPrepFlags] = useState<Record<string, boolean>>({});
  const [initialBirth, setInitialBirth] = useState<BirthWizardInitial | null>(null);
  const [prepStalled, setPrepStalled] = useState(false);
  const lastBirthInput = useRef<BirthProfileInput | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootExisting() {
      try {
        if (!user) return;
        const existing = await getBirthProfile(user.id);
        if (cancelled) return;
        if (existing && !isEdit) {
          const astro = await getAstrologyProfile(user.id);
          if (cancelled) return;
          lastBirthInput.current = birthRowToInput(existing as BirthWizardInitial & Record<string, unknown>);
          setInitialBirth(existing as BirthWizardInitial);
          if (astro?.status === 'pending' || astro?.status === 'generating') {
            setPhase('preparing');
            return;
          }
          if (astro?.status === 'failed') {
            setPhase('birth');
            return;
          }
          navigate('/kundli', { replace: true });
          return;
        }
        if (existing) {
          setInitialBirth(existing as BirthWizardInitial);
        }
        setPhase('birth');
      } catch (err) {
        console.error(err);
        setPhase('birth');
      }
    }
    void bootExisting();
    return () => {
      cancelled = true;
    };
  }, [isEdit, navigate, user]);

  useEffect(() => {
    if (phase !== 'preparing' || !user) return;
    let stop = false;
    const startedAt = Date.now();
    setPrepStalled(false);

    const handleAstroUpdate = (astro: AstrologyProfile | null) => {
      if (!astro || stop) return;
      setPrepFlags({
        planets_ready: Boolean(astro.planets_ready),
        houses_ready: Boolean(astro.houses_ready) || astro.profile_completeness === 'limited',
        dasha_ready: Boolean(astro.dasha_ready) || astro.profile_completeness === 'limited',
        predictions_ready: Boolean(astro.predictions_ready) || astro.profile_completeness === 'limited',
      });
      if (astro.core_ready || astro.status === 'ready' || astro.status === 'partial') {
        navigate('/kundli', { replace: true });
        return;
      }
      if (astro.status === 'failed') {
        toast.error(isHi ? 'कुंडली तैयार नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Kundli could not be prepared. Please try again.');
        setPhase('birth');
        return;
      }
      if (Date.now() - startedAt >= PREP_STALL_MS) {
        setPrepStalled(true);
      }
    };

    // 1. Initial fetch once upon entering preparing
    void getAstrologyProfile(user.id).then(handleAstroUpdate);

    // 2. Realtime WebSocket subscription (Instant push on DB change)
    const channel = supabase
      .channel(`astrology_profile_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'astrology_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            handleAstroUpdate(payload.new as AstrologyProfile);
          }
        }
      )
      .subscribe();

    // 3. Gentle 30-second fallback heartbeat
    const heartbeatId = window.setInterval(async () => {
      if (stop) return;
      try {
        const astro = await getAstrologyProfile(user.id);
        handleAstroUpdate(astro);
      } catch (err) {
        console.error('Kundli status heartbeat error:', err);
      }
      if (Date.now() - startedAt >= PREP_STALL_MS) {
        setPrepStalled(true);
      }
    }, 30000);

    return () => {
      stop = true;
      window.clearInterval(heartbeatId);
      void supabase.removeChannel(channel);
    };
  }, [phase, user, navigate, isHi]);

  const handlePrepare = async (input: BirthProfileInput, forceReenqueue = false) => {
    lastBirthInput.current = input;
    setSaving(true);
    setPrepStalled(false);
    try {
      await saveBirthProfile(input, { forceReenqueue });
      setPrepFlags({});
      setPhase('preparing');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save birth profile');
    } finally {
      setSaving(false);
    }
  };

  if (phase === 'boot') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[#FFFDF8] text-stone-800">
      <SEO title="Birth Profile Setup | Kundli" description="Set up your birth profile for authentic Vedic Kundli calculation." noindex />

      {phase === 'birth' && (
        <BirthDetailsWizard
          isHi={isHi}
          initial={initialBirth}
          saving={saving}
          confirmCta={isHi ? 'मेरी कुंडली तैयार करें' : 'Prepare my Kundli'}
          headerRight={
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Compass className="h-5 w-5" />
            </div>
          }
          onFirstBack={() => navigate(-1)}
          onSubmit={handlePrepare}
        />
      )}

      {phase === 'preparing' && (
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#651317] to-[#450A0E] flex items-center justify-center text-amber-200 shadow-md">
            <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h1 className="mt-6 font-serif text-2xl font-bold text-[#651317]">{isHi ? 'जन्मपत्रिका तैयार हो रही है' : 'Preparing your Janampatri'}</h1>
          <p className="mt-2 max-w-sm text-sm text-stone-600">
            {isHi ? 'आप यहाँ प्रतीक्षा कर सकते हैं या साइट का उपयोग जारी रख सकते हैं।' : 'You can wait here, or continue exploring while we finish.'}
          </p>
          <ul className="mt-8 w-full max-w-sm space-y-3 text-left">
            {PREP_STEPS.map((s) => {
              const done = Boolean(prepFlags[s.key]);
              return (
                <li key={s.key} className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm">
                  {done ? <Check className="h-4 w-4 text-emerald-600" /> : <Loader2 className="h-4 w-4 animate-spin text-amber-600" />}
                  {isHi ? s.hi : s.en}
                </li>
              );
            })}
          </ul>
          {prepStalled && (
            <div className="mt-6 max-w-sm space-y-3">
              <p className="text-sm text-stone-600">
                {isHi
                  ? 'कुंडली गणना में अधिक समय लग रहा है। आप पुनः प्रयास कर सकते हैं।'
                  : 'Calculation is taking longer than expected. You can retry.'}
              </p>
              <Button
                type="button"
                disabled={saving || !lastBirthInput.current}
                className="h-12 w-full rounded-2xl bg-[#651317] text-amber-100 hover:bg-[#500e12]"
                onClick={() => {
                  if (lastBirthInput.current) void handlePrepare(lastBirthInput.current, true);
                }}
              >
                {saving ? (isHi ? 'पुनः भेजा जा रहा है…' : 'Retrying…') : isHi ? 'पुनः प्रयास करें' : 'Retry calculation'}
              </Button>
            </div>
          )}
          <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => navigate('/panchang')}>
            {isHi ? 'आज का पंचांग देखें' : "Read today's Panchang"}
          </Button>
        </section>
      )}
    </div>
  );
}
