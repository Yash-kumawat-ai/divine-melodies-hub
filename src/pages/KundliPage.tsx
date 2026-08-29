import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Sparkles, Edit3, ShieldAlert, Loader2, ArrowLeft, Sun, Moon, Star, Clock, Heart, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getAstrologyProfile, getBirthProfile } from '@/lib/astrology/astrologyClient';
import { SEO } from '@/components/SEO';
import { NorthIndianKundliChart } from '@/components/astrology/NorthIndianKundliChart';

const PLANET_META: Record<string, { icon: any; color: string; deityHi: string }> = {
  Sun: { icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200', deityHi: 'सूर्य देव' },
  Moon: { icon: Moon, color: 'text-blue-500 bg-blue-50 border-blue-200', deityHi: 'चन्द्र देव' },
  Mars: { icon: Flame, color: 'text-red-500 bg-red-50 border-red-200', deityHi: 'मंगल देव' },
  Mercury: { icon: Star, color: 'text-emerald-500 bg-emerald-50 border-emerald-200', deityHi: 'बुध देव' },
  Jupiter: { icon: Sparkles, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', deityHi: 'बृहस्पति देव' },
  Venus: { icon: Heart, color: 'text-pink-500 bg-pink-50 border-pink-200', deityHi: 'शुक्र देव' },
  Saturn: { icon: Clock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', deityHi: 'शनि देव' },
  Rahu: { icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-200', deityHi: 'राहु' },
  Ketu: { icon: Star, color: 'text-stone-600 bg-stone-100 border-stone-300', deityHi: 'केतु' },
};

export default function KundliPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isHi = language === 'hi';

  const [birth, setBirth] = useState<any>(null);
  const [astro, setAstro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [birthData, astroData] = await Promise.all([
          getBirthProfile(user.id),
          getAstrologyProfile(user.id),
        ]);

        if (!birthData) {
          navigate('/kundli/setup');
          return;
        }

        setBirth(birthData);
        setAstro(astroData);
      } catch (err) {
        console.error('Error loading kundli:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const isUnknown = birth?.birth_time_accuracy === 'unknown';
  const isApproximate = birth?.birth_time_accuracy === 'approximate';
  const coreChart = astro?.core_chart || {};
  const planets = coreChart?.planets || {};
  const lagna = isUnknown ? undefined : coreChart?.lagna;
  const predictions = astro?.predictions || {};

  return (
    <div className="min-h-full overflow-y-auto bg-[#FFFDF8] py-8 px-4 sm:px-6 lg:px-8 text-stone-800">
      <SEO 
        title="Your Vedic Kundli & Horoscope | Raghavam" 
        description="Authentic Vedic Astrology Kundli details, North Indian diamond chart, and planetary positions."
        noindex={true}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-stone-600 hover:text-stone-900 gap-1.5 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            {isHi ? 'होम पर लौटें' : 'Back to Home'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/kundli/setup?edit=1')}
              className="text-xs border-amber-300 gap-1.5 rounded-xl"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isHi ? 'जन्म विवरण बदलें' : 'Edit Birth Details'}
            </Button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#651317] to-[#450A0E] flex items-center justify-center text-amber-200 shadow-md">
                <Compass className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#651317]">
                  {isHi ? 'आपकी जन्म कुण्डली' : 'Your Vedic Birth Chart'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 font-sans mt-0.5">
                  📍 {birth?.place_label || birth?.place_query} • 📅 {birth?.date_of_birth} {birth?.birth_time ? `at ${birth.birth_time}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 text-xs px-3 py-1">
                अयनांश: {astro?.ayanamsa || 'Lahiri'}
              </Badge>
              {isUnknown ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-900 text-xs px-3 py-1">
                  {isHi ? 'समय-अज्ञात (सीमित मोड)' : 'Limited Moon Sign'}
                </Badge>
              ) : isApproximate ? (
                <Badge className="bg-amber-600 text-white text-xs px-3 py-1">
                  {isHi ? 'अनुमानित समय (पूर्ण गणना)' : 'Approximate Time'}
                </Badge>
              ) : (
                <Badge className="bg-emerald-700 text-white text-xs px-3 py-1">
                  {isHi ? 'पूर्ण कुण्डली' : 'Full Kundli'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Profile Accuracy Notice */}
        {isUnknown ? (
          <div className="rounded-3xl bg-amber-50/95 border-2 border-amber-300 p-5 text-xs text-amber-950 space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-serif font-bold text-sm text-[#651317]">
                  {isHi ? 'सीमित वैदिक विश्लेषण (समय अज्ञात मोड)' : 'Limited Vedic Profile (Unknown Birth Time Mode)'}
                </p>
                <p className="mt-0.5 text-stone-700 leading-relaxed">
                  {isHi
                    ? 'जन्म समय उपलब्ध न होने के कारण वैदिक नियमों के अनुसार केवल समय-निरपेक्ष ग्रह गणनाएँ शामिल हैं।'
                    : 'Because exact birth time is missing, only time-independent planetary calculations are computed to maintain Vedic integrity.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200 text-xs">
              <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                  ✓ {isHi ? 'सक्रिय गणनाएँ (Active):' : 'Active Datasets:'}
                </span>
                <ul className="space-y-0.5 text-emerald-900 list-disc list-inside text-[11px]">
                  <li>{isHi ? 'नवग्रह राशि स्थिति (9 Grahas)' : '9 Graha Rasi Placements'}</li>
                  <li>{isHi ? 'चंद्र राशि एवं ग्रह वक्र स्थिति' : 'Moon Sign & Retrogrades'}</li>
                  <li>{isHi ? 'इष्टदेव एवं सामान्य मंत्र साधना' : 'Ishta Devata & Bhakti Indications'}</li>
                </ul>
              </div>

              <div className="bg-amber-100/70 p-2.5 rounded-xl border border-amber-300">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  ⚠ {isHi ? 'सुरक्षित रूप से रोकी गई (Withheld):' : 'Safely Withheld:'}
                </span>
                <ul className="space-y-0.5 text-amber-900 list-disc list-inside text-[11px]">
                  <li>{isHi ? 'लग्न चक्र (Ascendant / Lagna Chart)' : 'Ascendant / Lagna Diamond Chart'}</li>
                  <li>{isHi ? '१२ भाव एवं भाव-अधिपति (12 Houses)' : '12 House Cusps & Lords'}</li>
                  <li>{isHi ? 'भाव-आधारित दशा व भविष्यवाणी' : 'House-dependent Dasha Predictions'}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : isApproximate ? (
          <div className="rounded-3xl bg-amber-50/90 border border-amber-300 p-4 text-xs text-amber-950 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-bold shrink-0">
                ~
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-[#651317]">
                  {isHi ? 'अनुमानित समय कुण्डली (४/४ गणनाएं सक्रिय)' : 'Approximate Time Kundli (4/4 Datasets Active)'}
                </p>
                <p className="text-[11px] text-stone-700">
                  {isHi
                    ? 'सभी १२ भाव और दशा गणनाएँ उपलब्ध हैं, संधि भाव व सूक्ष्म समय-संकेतों को व्यापक प्रवृत्ति के रूप में देखें।'
                    : 'All 12 houses and dashas are computed; borderline house cusps represent broad tendencies.'}
                </p>
              </div>
            </div>
            <Badge className="bg-amber-700 text-white text-[11px] px-2.5 py-1 hidden sm:inline-flex">
              {isHi ? 'अनुमानित' : 'Approximate'}
            </Badge>
          </div>
        ) : (
          <div className="rounded-3xl bg-emerald-50/90 border border-emerald-300 p-4 text-xs text-emerald-950 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                ✓
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-emerald-950">
                  {isHi ? 'पूर्ण प्रामाणिक कुण्डली (४/४ गणनाएं सक्रिय)' : 'Complete Vedic Kundli (4/4 Datasets Active)'}
                </p>
                <p className="text-[11px] text-emerald-800">
                  {isHi
                    ? 'नवग्रह स्थिति, १२ भाव, लग्न चक्र, दशा काल एवं जीवन संकेत पूर्णतः सक्रिय हैं।'
                    : '9 Grahas, 12 Bhavas, Lagna Diamond Chart, Dasha Timeline, and Indications are fully computed.'}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-700 text-white text-[11px] px-2.5 py-1 hidden sm:inline-flex">
              100% Verified
            </Badge>
          </div>
        )}

        {/* North Indian Visual Kundli Chart Section */}
        {!isUnknown && Object.keys(planets).length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif font-bold text-[#651317] flex items-center justify-center gap-2">
                <Compass className="h-5 w-5 text-amber-700" />
                {isHi ? 'उत्तर भारतीय लग्न चक्र (Diamond Chart)' : 'North Indian Diamond Kundli Chart'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isHi ? '१२ भावों में नवग्रहों की वास्तविक स्थिति' : 'Authentic 12-house Vedic planetary layout'}
              </p>
            </div>

            <NorthIndianKundliChart
              planets={planets}
              lagnaSign={lagna == null ? '' : typeof lagna === 'object' ? JSON.stringify(lagna) : String(lagna)}
              isUnknownTime={isUnknown}
            />
          </div>
        )}

        {/* Grahas (Planets) Cards Grid */}
        <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#651317] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                {isHi ? 'नवग्रह स्थिति एवं राशियां' : 'Navagraha Planetary Positions'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHi ? 'ग्रह, राशि अंश, भाव और गति' : 'Planets, zodiac signs, degrees, and motion'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {Object.entries(planets).map(([name, data]: [string, any]) => {
              const meta = PLANET_META[name] || { icon: Star, color: 'text-stone-700 bg-stone-50 border-stone-200', deityHi: name };
              const IconComponent = meta.icon;

              return (
                <div
                  key={name}
                  className="rounded-2xl p-4 bg-stone-50/60 hover:bg-amber-50/40 border border-stone-200/80 hover:border-amber-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-xl border flex items-center justify-center ${meta.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-stone-900">{name}</h3>
                        <p className="text-[10px] text-stone-500">{isHi ? meta.deityHi : name}</p>
                      </div>
                    </div>

                    {data?.isRetrograde && (
                      <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 bg-rose-50 px-2 py-0.5">
                        वक्र (R)
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-stone-700 pt-1 border-t border-stone-200/50">
                    <div className="flex justify-between">
                      <span className="text-stone-500">{isHi ? 'राशि (Sign):' : 'Sign:'}</span>
                      <span className="font-semibold text-stone-900">{data?.sign || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">{isHi ? 'अंश (Degree):' : 'Degree:'}</span>
                      <span className="font-mono text-stone-800">{data?.degree ? `${data.degree.toFixed(2)}°` : '—'}</span>
                    </div>
                    {!isUnknown && data?.house && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">{isHi ? 'भाव (House):' : 'House:'}</span>
                        <span className="font-semibold text-amber-900">{data.house}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categorized Indications Section */}
        {Object.keys(predictions).length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#651317] flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-600" />
              {isHi ? 'ज्योतिषीय जीवन संकेत' : 'Astrological Indications'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(predictions).map(([topic, items]: [string, any]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                return (
                  <div key={topic} className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/70 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#651317] uppercase tracking-wide mb-2 capitalize flex items-center gap-1.5">
                        {topic === 'career' ? '💼' : topic === 'marriage' ? '💍' : topic === 'finance' ? '💰' : '🕉️'} {topic}
                      </h3>
                      <ul className="text-xs text-stone-700 space-y-2 list-disc list-inside leading-relaxed">
                        {items.map((it: string, idx: number) => (
                          <li key={idx}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
