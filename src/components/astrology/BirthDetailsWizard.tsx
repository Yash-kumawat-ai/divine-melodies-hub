import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Loader2, MapPin, Moon, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BIRTH_CITY_SEEDS, searchBirthPlaces, type GeocodedPlace } from '@/lib/astrology/geocodePlace';
import type { BirthProfileInput, BirthTimeAccuracy, Gender } from '@/lib/astrology/types';

export type BirthWizardStep = 'date' | 'time' | 'place' | 'gender' | 'confirm';
export type BirthTimeMode = BirthTimeAccuracy;
export type BirthApproxSlot = 'morning' | 'afternoon' | 'evening';

export const APPROX_TIMES: Record<BirthApproxSlot, string> = {
  morning: '06:00',
  afternoon: '12:00',
  evening: '18:00',
};

const ORDER: BirthWizardStep[] = ['date', 'time', 'place', 'gender', 'confirm'];

export type BirthWizardInitial = {
  date_of_birth?: string | null;
  birth_time?: string | null;
  birth_time_accuracy?: BirthTimeMode | string | null;
  gender?: string | null;
  place_label?: string | null;
  lat?: number | null;
  lng?: number | null;
  timezone_iana?: string | null;
  utc_offset_at_birth?: string | null;
  country_code?: string | null;
  admin1?: string | null;
};

type Props = {
  isHi: boolean;
  compact?: boolean;
  confirmExtra?: ReactNode;
  confirmCta: string;
  headerRight?: ReactNode;
  initial?: BirthWizardInitial | null;
  saving?: boolean;
  onFirstBack: () => void;
  onSubmit: (input: BirthProfileInput) => void | Promise<void>;
};

export function hydratePlace(existing: BirthWizardInitial): GeocodedPlace | null {
  if (!existing.place_label || existing.lat == null || existing.lng == null) return null;
  const matched = BIRTH_CITY_SEEDS.find((c) => c.label === existing.place_label);
  return (
    matched ?? {
      label: existing.place_label,
      city: existing.place_label,
      lat: Number(existing.lat),
      lng: Number(existing.lng),
      timezone_iana: existing.timezone_iana || 'Asia/Kolkata',
      utc_offset_at_birth: existing.utc_offset_at_birth || '+05:30',
      country_code: existing.country_code || 'IN',
      admin1: existing.admin1 || undefined,
    }
  );
}

export default function BirthDetailsWizard({
  isHi,
  compact = false,
  confirmExtra,
  confirmCta,
  headerRight,
  initial,
  saving = false,
  onFirstBack,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<BirthWizardStep>('date');
  const [dob, setDob] = useState(initial?.date_of_birth || '');
  const [timeMode, setTimeMode] = useState<BirthTimeMode>('exact');
  const [birthTime, setBirthTime] = useState('');
  const [approxSlot, setApproxSlot] = useState<BirthApproxSlot | null>(null);
  const [gender, setGender] = useState<Gender>('unspecified');
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<GeocodedPlace | null>(null);
  const [placeHits, setPlaceHits] = useState<GeocodedPlace[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const searchAbort = useRef<AbortController | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);
  const titleClass = compact ? 'font-serif text-xl font-bold text-[#651317]' : 'font-serif text-3xl font-bold text-[#651317]';

  useEffect(() => {
    if (!initial) return;
    setDob(initial.date_of_birth || '');
    if (initial.birth_time_accuracy === 'unknown' || !initial.birth_time) {
      setTimeMode('unknown');
      setBirthTime('');
    } else if (initial.birth_time_accuracy === 'approximate') {
      setTimeMode('approximate');
      const t = String(initial.birth_time).slice(0, 5);
      setBirthTime(t);
      const slot = (Object.entries(APPROX_TIMES).find(([, v]) => v === t)?.[0] as BirthApproxSlot | undefined) ?? null;
      setApproxSlot(slot);
    } else {
      setTimeMode('exact');
      setBirthTime(String(initial.birth_time).slice(0, 5));
    }
    setGender(initial.gender === 'male' || initial.gender === 'female' || initial.gender === 'other' ? initial.gender : 'unspecified');
    const hydrated = hydratePlace(initial);
    if (hydrated) {
      setPlace(hydrated);
      setPlaceQuery(hydrated.label);
    }
  }, [initial]);

  useEffect(() => {
    if (step !== 'place') return;
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
    }, 400);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [placeQuery, step]);

  const resolvedTime = useMemo(() => {
    if (timeMode === 'unknown') return null;
    if (timeMode === 'approximate') return approxSlot ? APPROX_TIMES[approxSlot] : null;
    return birthTime || null;
  }, [timeMode, approxSlot, birthTime]);

  const canNext = () => {
    if (step === 'date') return Boolean(dob) && dob <= todayIso && dob >= '1920-01-01';
    if (step === 'time') {
      if (timeMode === 'unknown') return true;
      if (timeMode === 'approximate') return Boolean(approxSlot);
      return /^\d{2}:\d{2}$/.test(birthTime);
    }
    if (step === 'place') return Boolean(place?.lat != null && place?.lng != null);
    if (step === 'gender') return Boolean(gender);
    return true;
  };

  const goNext = () => {
    if (!canNext()) {
      toast.error(isHi ? 'कृपया यह चरण पूरा करें' : 'Please complete this step');
      return;
    }
    const i = ORDER.indexOf(step);
    if (i >= 0 && i < ORDER.length - 1) setStep(ORDER[i + 1]);
  };

  const goBack = () => {
    const i = ORDER.indexOf(step);
    if (i > 0) setStep(ORDER[i - 1]);
    else onFirstBack();
  };

  const handleConfirm = async () => {
    if (!dob || !place) return;
    if (timeMode !== 'unknown' && !resolvedTime) {
      toast.error(isHi ? 'कृपया जन्म समय चुनें' : 'Please choose a birth time');
      return;
    }
    await onSubmit({
      date_of_birth: dob,
      birth_time: timeMode === 'unknown' ? null : resolvedTime,
      birth_time_accuracy: timeMode,
      gender,
      place_query: place.label,
      place_label: place.label,
      country_code: place.country_code,
      admin1: place.admin1,
      lat: place.lat,
      lng: place.lng,
      timezone_iana: place.timezone_iana,
      utc_offset_at_birth: place.utc_offset_at_birth,
    });
  };

  const timeLabel =
    timeMode === 'unknown'
      ? isHi
        ? 'समय अज्ञात'
        : 'Time unknown'
      : timeMode === 'approximate'
        ? `${resolvedTime || '—'} (${isHi ? 'अनुमानित' : 'approx'})`
        : resolvedTime || '—';

  const stepIndex = ORDER.indexOf(step);

  return (
    <div className={`flex flex-col text-stone-800 ${compact ? 'min-h-0' : 'h-dvh bg-[#FFFDF8]'}`}>
      <header className={`shrink-0 ${compact ? 'pb-3' : 'border-b border-amber-200/70 bg-white/90 px-4 py-3'}`}>
        <div className={`flex items-center justify-between ${compact ? '' : 'mx-auto max-w-lg'}`}>
          <button type="button" onClick={goBack} className="flex h-12 w-12 items-center justify-center rounded-2xl text-stone-600 hover:bg-amber-50" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {ORDER.map((s, i) => (
              <span key={s} className={`h-1.5 w-5 rounded-full sm:w-6 ${i <= stepIndex ? 'bg-[#651317]' : 'bg-amber-200'}`} />
            ))}
          </div>
          <div className="flex h-12 w-12 items-center justify-center">{headerRight}</div>
        </div>
      </header>

      <div className={`min-h-0 flex-1 ${compact ? '' : 'overflow-y-auto px-4 py-6'}`}>
        <div className={compact ? '' : 'mx-auto max-w-lg'}>
          {step === 'date' && (
            <section>
              <h1 className={titleClass}>{isHi ? 'जन्म तिथि' : 'Date of birth'}</h1>
              <p className="mt-2 text-sm text-stone-600">{isHi ? 'जैसा जन्म पत्रिका या अस्पताल रिकॉर्ड पर हो।' : 'As on your janampatri or hospital record.'}</p>
              <label className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-amber-600" />
                {isHi ? 'तिथि चुनें' : 'Choose date'}
              </label>
              <Input
                type="date"
                required
                min="1920-01-01"
                max={todayIso}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-2 h-14 rounded-2xl border-stone-300 text-base"
              />
            </section>
          )}

          {step === 'time' && (
            <section className="space-y-4">
              <h1 className={titleClass}>{isHi ? 'जन्म समय' : 'Birth time'}</h1>
              <p className="text-sm text-stone-600">
                {isHi ? 'लग्न के लिए समय चाहिए। समय न हो तो चंद्र राशि से मार्गदर्शन होगा।' : 'Lagna needs time. Without it, guidance uses Chandra rasi only.'}
              </p>
              <div className="grid gap-2">
                {(
                  [
                    ['exact', isHi ? 'सटीक समय पता है' : 'I know the exact time'],
                    ['approximate', isHi ? 'अनुमानित (सुबह / दोपहर / शाम)' : 'Approximate (morning / afternoon / evening)'],
                    ['unknown', isHi ? 'समय नहीं पता' : "I don't know the time"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTimeMode(id)}
                    className={`min-h-12 rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium ${
                      timeMode === id ? 'border-[#651317] bg-amber-50' : 'border-amber-200 bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {timeMode === 'exact' && (
                <Input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="h-14 rounded-2xl text-base" />
              )}
              {timeMode === 'approximate' && (
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setApproxSlot(slot)}
                      className={`min-h-12 rounded-2xl border-2 text-xs font-semibold ${
                        approxSlot === slot ? 'border-[#651317] bg-amber-50' : 'border-amber-200 bg-white'
                      }`}
                    >
                      {slot === 'morning' ? (isHi ? 'सुबह' : 'Morning') : slot === 'afternoon' ? (isHi ? 'दोपहर' : 'Afternoon') : isHi ? 'शाम' : 'Evening'}
                    </button>
                  ))}
                </div>
              )}
              {timeMode === 'unknown' && (
                <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <Moon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p>{isHi ? 'लग्न निश्चित नहीं माना जाएगा। मार्गदर्शन चंद्र राशि पर आधारित होगा।' : 'Lagna will not be treated as certain. Guidance will rest on your Moon sign.'}</p>
                </div>
              )}
            </section>
          )}

          {step === 'place' && (
            <section>
              <h1 className={titleClass}>{isHi ? 'जन्म स्थान' : 'Place of birth'}</h1>
              <p className="mt-2 text-sm text-stone-600">{isHi ? 'शहर खोजें। गणना अक्षांश-देशांतर से होती है।' : 'Search a city. Calculation uses latitude and longitude.'}</p>
              <label className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-amber-600" />
                {isHi ? 'खोजें' : 'Search'}
              </label>
              <Input
                value={placeQuery}
                onChange={(e) => {
                  setPlaceQuery(e.target.value);
                  setPlace(null);
                }}
                placeholder={isHi ? 'जैसे पुणे, जयपुर' : 'e.g. Pune, Jaipur'}
                className="mt-2 h-14 rounded-2xl text-base"
              />
              {placeLoading && <p className="mt-2 text-xs text-stone-500">{isHi ? 'खोज रहा है…' : 'Searching…'}</p>}
              {placeHits.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {placeHits.map((hit) => (
                    <li key={`${hit.label}-${hit.lat}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setPlace(hit);
                          setPlaceQuery(hit.label);
                          setPlaceHits([]);
                        }}
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-left text-sm hover:bg-amber-50"
                      >
                        {hit.label}
                        <span className="mt-0.5 block text-[11px] text-stone-500">
                          {hit.lat.toFixed(4)}, {hit.lng.toFixed(4)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs font-semibold text-stone-500">{isHi ? 'त्वरित शहर' : 'Quick cities'}</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {BIRTH_CITY_SEEDS.map((city) => (
                  <button
                    key={city.label}
                    type="button"
                    onClick={() => {
                      setPlace(city);
                      setPlaceQuery(city.label);
                      setPlaceHits([]);
                    }}
                    className={`min-h-12 truncate rounded-xl border px-2 text-xs font-medium ${
                      place?.label === city.label ? 'border-[#651317] bg-amber-50' : 'border-amber-200 bg-white'
                    }`}
                  >
                    {city.city}
                  </button>
                ))}
              </div>
              {place && (
                <p className="mt-3 text-xs text-emerald-800">
                  {isHi ? 'गणना के लिए' : 'Using'} {place.lat.toFixed(4)}, {place.lng.toFixed(4)} · {place.timezone_iana}
                </p>
              )}
            </section>
          )}

          {step === 'gender' && (
            <section>
              <h1 className={titleClass}>{isHi ? 'लिंग' : 'Gender'}</h1>
              <p className="mt-2 text-sm text-stone-600">{isHi ? 'संबोधन के लिए।' : 'So we can address you respectfully.'}</p>
              <div className="mt-6 grid gap-2">
                {(
                  [
                    ['male', isHi ? 'पुरुष' : 'Male'],
                    ['female', isHi ? 'महिला' : 'Female'],
                    ['other', isHi ? 'अन्य' : 'Other'],
                    ['unspecified', isHi ? 'कहना नहीं चाहते' : 'Prefer not to say'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setGender(id)}
                    className={`flex min-h-12 items-center gap-2 rounded-2xl border-2 px-4 text-left text-sm font-medium ${
                      gender === id ? 'border-[#651317] bg-amber-50' : 'border-amber-200 bg-white'
                    }`}
                  >
                    <User className="h-4 w-4 text-amber-700" />
                    {label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 'confirm' && (
            <section>
              <h1 className={titleClass}>{isHi ? 'पुष्टि करें' : 'Confirm details'}</h1>
              <div className="mt-6 space-y-3 rounded-3xl border-2 border-amber-200 bg-white p-5 text-sm">
                {confirmExtra}
                <p>
                  <span className="text-stone-500">{isHi ? 'तिथि' : 'Date'}: </span>
                  <strong>{dob || '—'}</strong>
                </p>
                <p>
                  <span className="text-stone-500">{isHi ? 'समय' : 'Time'}: </span>
                  <strong>{timeLabel}</strong>
                </p>
                <p>
                  <span className="text-stone-500">{isHi ? 'स्थान' : 'Place'}: </span>
                  <strong>{place?.label || '—'}</strong>
                </p>
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs text-stone-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {isHi
                  ? 'आपका जन्म विवरण निजी है और केवल आपकी कुंडली के लिए उपयोग होता है।'
                  : 'Your birth details are private and used only to prepare your Kundli.'}
              </p>
            </section>
          )}
        </div>
      </div>

      <footer className={`shrink-0 ${compact ? 'pt-4' : 'border-t border-amber-200/70 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'}`}>
        <div className={compact ? '' : 'mx-auto max-w-lg'}>
          {step === 'confirm' ? (
            <Button
              type="button"
              disabled={saving || !place || !dob}
              onClick={() => void handleConfirm()}
              className="h-12 w-full rounded-2xl bg-[#651317] text-base font-semibold text-amber-100 hover:bg-[#500e12]"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : confirmCta}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!canNext()}
              onClick={goNext}
              className="h-12 w-full rounded-2xl bg-[#651317] text-base font-semibold text-amber-100 hover:bg-[#500e12]"
            >
              {isHi ? 'आगे' : 'Next'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
