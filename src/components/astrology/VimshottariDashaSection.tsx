import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { NormalizedDasha } from '@/lib/astrology/types';

interface VimshottariDashaSectionProps {
  dasha?: NormalizedDasha;
  isHi: boolean;
}

function fmtDate(d: string | undefined): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d.slice(0, 10);
  }
}

function getDashaProgress(dasha: any): number {
  if (dasha?.currentMahadasha?.progressPercent != null && dasha.currentMahadasha.progressPercent > 0) {
    return dasha.currentMahadasha.progressPercent;
  }
  const start = dasha?.currentMahadasha?.startTime || dasha?.currentMahadasha?.startDate;
  const end   = dasha?.currentMahadasha?.endTime || dasha?.currentMahadasha?.endDate;
  if (!start || !end) return 35;
  const now = Date.now();
  const s   = new Date(start).getTime();
  const e   = new Date(end).getTime();
  if (e <= s || isNaN(s) || isNaN(e)) return 35;
  return Math.min(100, Math.max(1, Math.round(((now - s) / (e - s)) * 100)));
}

const VimshottariDashaSectionInner: React.FC<VimshottariDashaSectionProps> = ({ dasha, isHi }) => {
  const [isFullCycleOpen, setIsFullCycleOpen] = useState(false);
  if (!dasha) return null;

  const progress = getDashaProgress(dasha);

  return (
    <section id="dasha" className="scroll-mt-32 space-y-3">
      <div className="border-b border-brand-gold-border/30 pb-2.5">
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-gold shrink-0" />
          <span>{isHi ? 'विंशोत्तरी दशा समय-चक्र' : 'Vimshottari Dasha Timeline'}</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHi ? '120 वर्षीय महादशा एवं वर्तमान सक्रिय ग्रह काल' : '120-year planetary cycle and current active influence'}
        </p>
      </div>

      {/* Active Period Card (Level 2 Information Group) */}
      <div className="rounded-xl bg-gradient-to-br from-amber-500/10 via-surface-raised to-brand-primary/10 border border-brand-gold-border/40 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isHi ? 'वर्तमान सक्रिय ग्रह काल' : 'Current Active Planetary Period'}
            </span>
            <h3 className="font-display font-bold text-sm sm:text-base text-brand-primary dark:text-brand-gold leading-tight mt-0.5">
              {dasha.currentMahadasha?.planetHi || dasha.current_mahadasha || '—'} {isHi ? 'महादशा' : 'Mahadasha'}
              {dasha.currentAntardasha?.planetHi && ` · ${dasha.currentAntardasha.planetHi} ${isHi ? 'अंतर्दशा' : 'Antardasha'}`}
            </h3>
            {dasha.currentMahadasha?.endTime && (
              <p className="text-xs text-muted-foreground mt-1 tabular-nums font-medium">
                {isHi ? 'समाप्ति तिथि:' : 'Until:'} {fmtDate(dasha.currentMahadasha.endTime)}
              </p>
            )}
          </div>
          <span className="badge-brand text-xs px-2.5 py-0.5 shrink-0 font-bold self-start sm:self-auto">
            {progress}% {isHi ? 'पूर्ण' : 'elapsed'}
          </span>
        </div>

        {/* Dynamic Progress Bar (Golden Amber to Temple Crimson Gradient) */}
        <div
          className="w-full h-2.5 rounded-full overflow-hidden border border-brand-gold-border/35 p-[1px]"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, #ffffff 50%, rgba(101, 19, 23, 0.12) 100%)',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 shadow-2xs"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 45%, #651317 100%)',
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-0.5 tabular-nums font-medium">
          <span>{fmtDate(dasha.currentMahadasha?.startTime)}</span>
          <span>{fmtDate(dasha.currentMahadasha?.endTime)}</span>
        </div>
      </div>

      {/* Expandable Full 120-Yr Sequence */}
      {dasha.fullCycle && dasha.fullCycle.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setIsFullCycleOpen(!isFullCycleOpen)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-surface-raised/40 border border-brand-gold-border/30 text-xs font-semibold text-foreground hover:bg-brand-primary/5 transition-all"
          >
            <span>{isHi ? 'संपूर्ण 120 वर्षीय महादशा चक्र देखें' : 'View Full 120-Year Mahadasha Sequence'}</span>
            {isFullCycleOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
          </button>

          {isFullCycleOpen && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {dasha.fullCycle.map((item, idx) => {
                const isCurrent = item.planet === dasha.currentMahadasha?.planet || (item as any).isCurrent;
                const isPast = item.endTime && new Date(item.endTime) < new Date();

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'border-brand-primary bg-brand-primary/10 font-bold shadow-sm'
                        : isPast
                        ? 'border-brand-gold-border/20 bg-surface-raised/30 opacity-60'
                        : 'border-brand-gold-border/30 bg-surface-raised/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display font-semibold text-foreground truncate">
                        {item.planetHi || item.planet} महादशा
                      </span>
                      {isCurrent && (
                        <span className="badge-brand text-[9px] px-2 py-0.5 shrink-0 font-bold">
                          {isHi ? 'सक्रिय' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 tabular-nums font-medium">
                      {fmtDate(item.startTime)} – {fmtDate(item.endTime)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export const VimshottariDashaSection = React.memo(VimshottariDashaSectionInner);
