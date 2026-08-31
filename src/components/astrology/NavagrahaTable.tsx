import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Sun, Moon, Flame, Clock, Heart, Sparkles, Info } from 'lucide-react';
import type { NormalizedPlanet } from '@/lib/astrology/types';

interface NavagrahaTableProps {
  planets: Record<string, NormalizedPlanet>;
  isHi: boolean;
}

const VEDIC_PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANET_ICONS: Record<string, any> = {
  Sun: Sun,
  Moon: Moon,
  Mars: Flame,
  Mercury: Star,
  Jupiter: Sparkles,
  Venus: Heart,
  Saturn: Clock,
  Rahu: Star,
  Ketu: Star,
};

const DIGNITY_BADGES: Record<string, { hi: string; en: string; cls: string }> = {
  exalted:      { hi: 'उच्च',        en: 'Exalted',       cls: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' },
  moolatrikona: { hi: 'मूलत्रिकोण',  en: 'Moolatrikona',  cls: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/40' },
  own:          { hi: 'स्वराशि',     en: 'Own Sign',      cls: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/40' },
  friend:       { hi: 'मित्र',       en: 'Friend',        cls: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/25' },
  neutral:      { hi: 'सम',          en: 'Neutral',       cls: 'bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-500/20' },
  enemy:        { hi: 'शत्रु',       en: 'Enemy',         cls: 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40' },
  debilitated:  { hi: 'नीच',         en: 'Debilitated',   cls: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40' },
};

const NavagrahaTableInner: React.FC<NavagrahaTableProps> = ({ planets, isHi }) => {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    setExpandedPlanet(expandedPlanet === name ? null : name);
  };

  const validPlanets = VEDIC_PLANET_ORDER.filter((n) => planets[n]);

  return (
    <section id="planets" className="scroll-mt-32 space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-brand-gold-border/30 pb-2">
        <div>
          <h2 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-gold shrink-0" />
            <span>{isHi ? 'नवग्रह स्थिति एवं खगोलीय विवरण' : 'Navagraha Planetary Positions'}</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isHi ? '९ शास्त्रीय वैदिक ग्रहों की राशि, अंश, नक्षत्र, भाव और गरिमा' : 'Detailed astronomical placement for all 9 Vedic Grahas'}
          </p>
        </div>
      </div>

      {/* Scannable Flat Table (Level 3 Density on Desktop, Accordion on Mobile) */}
      <div className="rounded-xl border border-brand-gold-border/30 bg-surface-raised/30 overflow-hidden shadow-sm">
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-[130px_1fr_100px_1fr_70px_110px_36px] gap-2 p-3 bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
          <span>{isHi ? 'ग्रह' : 'Planet'}</span>
          <span>{isHi ? 'राशि (Sign)' : 'Sign (Rashi)'}</span>
          <span>{isHi ? 'अंश (Degree)' : 'Degree'}</span>
          <span>{isHi ? 'नक्षत्र एवं पाद' : 'Nakshatra & Pada'}</span>
          <span className="text-center">{isHi ? 'भाव' : 'House'}</span>
          <span>{isHi ? 'स्थिति / गरिमा' : 'Dignity'}</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/30">
          {validPlanets.map((name) => {
            const data = planets[name];
            const Icon = PLANET_ICONS[name] || Star;
            const isExpanded = expandedPlanet === name;
            const dignityBadge = data.dignity ? DIGNITY_BADGES[data.dignity] : null;

            return (
              <div key={name} className="transition-colors hover:bg-muted/20">
                {/* Desktop Grid Row */}
                <div
                  onClick={() => toggleExpand(name)}
                  className="hidden md:grid grid-cols-[130px_1fr_100px_1fr_70px_110px_36px] gap-2 p-3 items-center text-xs text-foreground cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 font-display font-bold">
                    <Icon className="h-4 w-4 text-brand-primary dark:text-brand-gold shrink-0" />
                    <span>{isHi ? data.nameHindi || data.name : data.name}</span>
                    {data.isRetrograde && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-900 dark:text-amber-300 font-mono font-bold" title={isHi ? 'वक्री (Retrograde)' : 'Retrograde'}>
                        {isHi ? 'व' : 'R'}
                      </span>
                    )}
                  </div>

                  <div className="font-semibold text-foreground/90">
                    {isHi ? data.rashiNameHindi || data.sign : data.sign}
                    {data.signLord && <span className="text-[10px] text-muted-foreground ml-1">({data.signLord})</span>}
                  </div>

                  <div className="font-mono text-muted-foreground">
                    {data.degree != null ? `${data.degree.toFixed(2)}°` : '—'}
                  </div>

                  <div className="text-xs">
                    <span className="font-medium text-foreground">{data.nakshatra || '—'}</span>
                    {data.nakshatraPada != null && (
                      <span className="text-[10px] text-muted-foreground ml-1">
                        (पाद {data.nakshatraPada})
                      </span>
                    )}
                  </div>

                  <div className="text-center font-bold font-mono">
                    {data.house != null ? data.house : '—'}
                  </div>

                  <div>
                    {dignityBadge ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold inline-block ${dignityBadge.cls}`}>
                        {isHi ? dignityBadge.hi : dignityBadge.en}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 text-[10px]">—</span>
                    )}
                  </div>

                  <div className="text-muted-foreground flex justify-end">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Mobile Scannable Row */}
                <div
                  onClick={() => toggleExpand(name)}
                  className="md:hidden p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 text-brand-primary dark:text-brand-gold shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-xs text-foreground truncate">
                          {isHi ? data.nameHindi || data.name : data.name}
                        </span>
                        {data.isRetrograde && (
                          <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-900 dark:text-amber-300 font-mono font-bold">
                            {isHi ? 'वक्री' : 'R'}
                          </span>
                        )}
                        {dignityBadge && (
                          <span className={`text-[8px] px-1.5 rounded-full border font-semibold ${dignityBadge.cls}`}>
                            {isHi ? dignityBadge.hi : dignityBadge.en}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {isHi ? data.rashiNameHindi || data.sign : data.sign} • {data.degree != null ? `${data.degree.toFixed(1)}°` : ''} • {data.nakshatra || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {data.house != null && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                        {data.house} {isHi ? 'भाव' : 'H'}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Progressive Disclosure: Astrological Significance Drawer */}
                {isExpanded && (
                  <div className="p-3.5 bg-background/90 border-t border-brand-gold-border/20 text-xs leading-relaxed space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-brand-primary dark:text-brand-gold font-semibold text-[11px]">
                      <Info className="h-3.5 w-3.5" />
                      <span>{isHi ? 'ज्योतिषीय विश्लेषण व प्रभाव:' : 'Astrological Significance:'}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {isHi ? (
                        <>
                          <strong>{data.nameHindi || data.name}</strong> ग्रह <strong>{data.rashiNameHindi || data.sign}</strong> राशि में {data.degree != null ? `${data.degree.toFixed(2)}°` : ''} अंश पर स्थित हैं।
                          यह <strong>{data.nakshatra || '—'}</strong> नक्षत्र {data.nakshatraPada ? `(पाद ${data.nakshatraPada})` : ''} में भ्रमणशील हैं।
                          {data.house ? ` कुंडली के ${data.house}वें भाव में इनकी स्थिति जीवन में विशिष्ट प्रभाव डालती है।` : ''}
                        </>
                      ) : (
                        <>
                          <strong>{data.name}</strong> is situated in <strong>{data.sign}</strong> at {data.degree != null ? `${data.degree.toFixed(2)}°` : ''}.
                          It transits through <strong>{data.nakshatra || '—'}</strong> Nakshatra {data.nakshatraPada ? `(Pada ${data.nakshatraPada})` : ''}
                          {data.house ? ` and activates the ${data.house}th house of your chart.` : '.'}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const NavagrahaTable = React.memo(NavagrahaTableInner);
