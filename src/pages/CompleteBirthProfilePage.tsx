import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Loader2, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getBirthProfile, saveBirthProfile } from '@/lib/astrology/astrologyClient';
import { safeAppPath } from '@/lib/astrology/completeProfileRedirect';
import { searchBirthPlaces, type GeocodedPlace } from '@/lib/astrology/geocodePlace';
import BirthTimeWheelDialog, { formatBirthTime12 } from '@/components/astrology/BirthTimeWheelDialog';
import { SEO } from '@/components/SEO';
import { markBirthProfileReady } from '@/components/Auth/BirthProfileGate';

type Gender = 'male' | 'female' | 'other';

export default function CompleteBirthProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeAppPath(params.get('next') || params.get('redirect'), '/');

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<GeocodedPlace | null>(null);
  const [placeHits, setPlaceHits] = useState<GeocodedPlace[]>([]);
  const [timeOpen, setTimeOpen] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const searchAbort = useRef<AbortController | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fromProfile =
      profile?.name ||
      (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
      (typeof user?.user_metadata?.name === 'string' && user.user_metadata.name) ||
      '';
    if (fromProfile) setName(fromProfile);
  }, [profile?.name, user]);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user) {
        if (!loading) setChecking(false);
        return;
      }
      try {
        const existing = await getBirthProfile(user.id);
        if (!cancelled && existing?.date_of_birth) {
          navigate(next, { replace: true });
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate, next]);

  useEffect(() => {
    if (place) return;
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceHits([]);
      return;
    }
    searchAbort.current?.abort();
    const ac = new AbortController();
    searchAbort.current = ac;
    const t = window.setTimeout(async () => {
      setPlaceLoading(true);
      try {
        const hits = await searchBirthPlaces(q, ac.signal);
        if (!ac.signal.aborted) setPlaceHits(hits);
      } catch {
        if (!ac.signal.aborted) setPlaceHits([]);
      } finally {
        if (!ac.signal.aborted) setPlaceLoading(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [placeQuery, place]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#651317]" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(`/auth/complete-profile?next=${encodeURIComponent(next)}`)}`}
        replace
      />
    );
  }

  const canFinish =
    name.trim().length >= 2 &&
    Boolean(dob) &&
    dob <= todayIso &&
    dob >= '1920-01-01' &&
    Boolean(gender) &&
    Boolean(place?.lat != null && place?.lng != null) &&
    (unknownTime || !birthTime || /^\d{2}:\d{2}$/.test(birthTime));

  const handleFinish = async () => {
    if (!canFinish || !place || !gender) {
      toast.error(isHi ? 'कृपया आवश्यक विवरण भरें।' : 'Please fill the required details.');
      return;
    }
    setSaving(true);
    try {
      if (name.trim() !== (profile?.name || '')) {
        await updateProfile({ name: name.trim() });
      }
      const timeUnknown = unknownTime || !birthTime;
      await saveBirthProfile({
        date_of_birth: dob,
        birth_time: timeUnknown ? null : birthTime,
        birth_time_accuracy: timeUnknown ? 'unknown' : 'exact',
        gender,
        place_query: place.label,
        place_label: place.label,
        country_code: place.country_code,
        admin1: place.admin1,
        lat: place.lat,
        lng: place.lng,
        elevation: place.elevation,
        timezone_iana: place.timezone_iana,
        utc_offset_at_birth: place.utc_offset_at_birth,
      });
      toast.success(isHi ? 'स्वागत है।' : 'Welcome.');
      markBirthProfileReady(user.id);
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : isHi ? 'सहेज नहीं सके। पुनः प्रयास करें।' : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    'h-12 rounded-xl border border-[#E8D5C4] bg-white pl-4 pr-11 text-sm text-stone-800 placeholder:text-stone-400 focus-visible:ring-[#C45C26]';

  return (
    <div className="min-h-dvh bg-[#FFFDF8] text-stone-800">
      <SEO title="Registration | Raghavam" description="Tell us about yourself to complete your Raghavam profile." noindex />
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-3">
        <header className="relative mb-4 flex h-11 items-center justify-center">
          <button
            type="button"
            onClick={() => navigate('/auth/login?from=registration', { replace: true })}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-stone-700"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-stone-800">{isHi ? 'पंजीकरण' : 'Registration'}</h1>
        </header>

        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3E4D4] ring-1 ring-[#E8C9A8]">
            <User className="h-10 w-10 text-[#C45C26]" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">{isHi ? 'अपने बारे में बताएं' : 'Tell us about yourself'}</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
            {isHi
              ? 'सटीक ज्योतिष मार्गदर्शन के लिए कृपया अपना जन्म विवरण दें।'
              : 'Please provide your birth details for accurate astrological guidance.'}
          </p>
        </div>

        <form
          className="flex flex-1 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleFinish();
          }}
        >
          <label className="block text-left">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              {isHi ? 'नाम' : 'Name'} <span className="text-rose-500">*</span>
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isHi ? 'पूरा नाम लिखें' : 'Enter your full name'}
              className={fieldClass.replace('pr-11', 'pr-4')}
              autoComplete="name"
            />
          </label>

          <label className="block text-left">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              {isHi ? 'जन्म तिथि' : 'Date of Birth'} <span className="text-rose-500">*</span>
            </span>
            <div className="relative">
              <Input
                type="date"
                required
                min="1920-01-01"
                max={todayIso}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={fieldClass}
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C45C26]" />
            </div>
          </label>

          <div className="text-left">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              {isHi ? 'जन्म समय (वैकल्पिक)' : 'Time of Birth (Optional)'}
            </span>
            <div className="relative">
              <button
                type="button"
                disabled={unknownTime}
                onClick={() => setTimeOpen(true)}
                className={`${fieldClass} flex w-full items-center text-left disabled:bg-stone-100`}
              >
                <span className={birthTime ? 'text-stone-800' : 'text-stone-400'}>
                  {birthTime ? formatBirthTime12(birthTime) : isHi ? 'घंटा : मिनट AM/PM' : 'hh:mm AM/PM'}
                </span>
              </button>
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C45C26]" />
            </div>
            <BirthTimeWheelDialog
              open={timeOpen}
              value={birthTime}
              isHi={isHi}
              onOpenChange={setTimeOpen}
              onConfirm={(hhmm) => {
                setBirthTime(hhmm);
                setUnknownTime(false);
              }}
            />
            <label className="mt-2.5 flex items-center gap-2 text-sm text-stone-600">
              <Checkbox
                checked={unknownTime}
                onCheckedChange={(v) => {
                  const on = v === true;
                  setUnknownTime(on);
                  if (on) setBirthTime('');
                }}
              />
              {isHi ? 'मुझे सटीक जन्म समय नहीं पता' : "I don't know my exact birth time"}
            </label>
          </div>

          <div className="text-left">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              {isHi ? 'लिंग' : 'Gender'} <span className="text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['male', isHi ? 'पुरुष' : 'Male'],
                  ['female', isHi ? 'महिला' : 'Female'],
                  ['other', isHi ? 'अन्य' : 'Other'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGender(id)}
                  className={`h-11 rounded-xl text-sm font-semibold ${
                    gender === id ? 'bg-[#E8A06A] text-white' : 'bg-transparent text-stone-500 ring-1 ring-[#E8D5C4]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-left">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              {isHi ? 'जन्म स्थान' : 'Place of Birth'} <span className="text-rose-500">*</span>
            </span>
            <div className="relative">
              <Input
                value={placeQuery}
                onChange={(e) => {
                  setPlaceQuery(e.target.value);
                  setPlace(null);
                }}
                placeholder={isHi ? 'शहर खोजें' : 'Search your city'}
                className={fieldClass}
                autoComplete="off"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C45C26]" />
            </div>
            {placeLoading && <p className="mt-1 text-xs text-stone-400">{isHi ? 'खोज रहा है…' : 'Searching…'}</p>}
            {placeHits.length > 0 && !place && (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[#E8D5C4] bg-white">
                {placeHits.map((hit) => (
                  <li key={`${hit.label}-${hit.lat}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setPlace(hit);
                        setPlaceQuery(hit.label);
                        setPlaceHits([]);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-[#FFF4EA]"
                    >
                      {hit.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="submit"
            disabled={saving || !canFinish}
            className="mt-auto h-12 w-full rounded-xl bg-[#E08A3C] text-base font-bold text-white hover:bg-[#D07A2C] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isHi ? 'पूर्ण करें' : 'Finish'}
          </Button>
        </form>
      </div>
    </div>
  );
}
