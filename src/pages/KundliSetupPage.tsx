import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { saveCompleteKundliProfile, getBirthProfile, getAstrologyProfile } from '@/lib/astrology/astrologyClient';
import type { BirthProfileInput } from '@/lib/astrology/types';
import { SEO } from '@/components/SEO';
import BirthDetailsWizard, { type BirthWizardInitial } from '@/components/astrology/BirthDetailsWizard';

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
    elevation: Number(row.elevation ?? 0),
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialBirth, setInitialBirth] = useState<BirthWizardInitial | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootExisting() {
      try {
        if (!user) return;
        const existing = await getBirthProfile(user.id);
        if (cancelled) return;
        if (existing && !isEdit) {
          setInitialBirth(existing as BirthWizardInitial);
          navigate('/kundli', { replace: true });
          return;
        }
        if (existing) {
          setInitialBirth(existing as BirthWizardInitial);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void bootExisting();
    return () => {
      cancelled = true;
    };
  }, [isEdit, navigate, user]);

  const handlePrepare = async (input: BirthProfileInput) => {
    if (!user) {
      toast.error(isHi ? 'कृपया पहले लॉगिन करें।' : 'Please log in first.');
      return;
    }
    setSaving(true);
    try {
      await saveCompleteKundliProfile(user.id, input);
      toast.success(isHi ? 'आपकी कुण्डली तैयार है!' : 'Your Kundli is ready!');
      navigate('/kundli', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : isHi ? 'कुण्डली तैयार करने में त्रुटि।' : 'Failed to prepare Kundli.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#651317]" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[#FFFDF8] text-stone-800">
      <SEO title="Birth Profile Setup | Kundli | Raghavam" description="Set up your birth profile for authentic Vedic Kundli calculation." noindex />

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
    </div>
  );
}

