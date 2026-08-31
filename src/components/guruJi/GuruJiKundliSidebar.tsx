import React, { useState, memo } from 'react';
import { Compass, Sparkles, Flame, ShieldCheck, ArrowRight, MessageSquarePlus, Trash2, Clock, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CompleteKundliData } from '@/lib/astrology/types';
import type { GuruJiChatSession } from '@/lib/astrology/guruJiChatHistory';
import { cn } from '@/lib/utils';

interface GuruJiKundliSidebarProps {
  kundli: CompleteKundliData | null;
  isHi: boolean;
  sessions?: GuruJiChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onNewConsultation: () => void;
  onClearHistory: () => void;
}

const GuruJiKundliSidebarInner: React.FC<GuruJiKundliSidebarProps> = ({
  kundli,
  isHi,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewConsultation,
  onClearHistory,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'kundli' | 'history'>('kundli');

  if (!kundli) {
    return (
      <aside className="hidden lg:flex w-80 flex-col gap-4 border-r border-border bg-card/60 p-4 shrink-0 h-full">
        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewConsultation}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs hover:opacity-90 active:scale-98 transition-all"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>{isHi ? 'नया संवाद' : 'New Chat'}</span>
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto text-brand-primary">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">
            {isHi ? 'जन्म कुण्डली जोड़ें' : 'Link Your Birth Kundli'}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isHi
              ? 'गुरु जी से अपनी कुंडली के अनुसार सटीक मार्गदर्शन पाने के लिए अपना जन्म विवरण दर्ज करें।'
              : 'Add your birth date, time, and location to receive precise astrological counsel from Guru Ji.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/kundli/setup')}
            className="btn-primary btn-sm w-full"
          >
            {isHi ? 'कुंडली विवरण भरें' : 'Set Up Birth Profile'}
          </button>
        </div>
      </aside>
    );
  }

  const isUnknownTime = kundli.birthDetails?.birthTimeAccuracy === 'unknown';
  const ascName = isUnknownTime ? '—' : (isHi ? kundli.ascendant?.rashiNameHi : kundli.ascendant?.rashiName) || '—';
  const moonSign = isHi ? kundli.planets.Moon?.rashiNameHindi : kundli.planets.Moon?.sign;
  const sunSign = isHi ? kundli.planets.Sun?.rashiNameHindi : kundli.planets.Sun?.sign;
  const nakshatra = kundli.planets.Moon?.nakshatra || kundli.panchanga?.nakshatra || '—';
  const nakPada = kundli.planets.Moon?.nakshatraPada || 1;

  const currentMD = isHi ? kundli.dasha?.currentMahadasha?.planetHi || kundli.dasha?.current_mahadasha : kundli.dasha?.currentMahadasha?.planet || kundli.dasha?.current_mahadasha;
  const currentAD = isHi ? kundli.dasha?.currentAntardasha?.planetHi || kundli.dasha?.current_antardasha : kundli.dasha?.currentAntardasha?.planet || kundli.dasha?.current_antardasha;

  const ishtaName = isHi ? kundli.ishtaDevata?.deityHi || kundli.ishtaDevata?.deity : kundli.ishtaDevata?.deity;
  const ishtaMantra = kundli.ishtaDevata?.mantra || 'ॐ रां रामाय नमः';

  const hasDosha = kundli.mangalDosha?.hasDosha;
  const dashaProgress = kundli.dasha?.currentMahadasha?.progressPercent || 45;

  return (
    <aside className="hidden lg:flex w-[330px] flex-col border-r border-border bg-card/40 shrink-0 h-full overflow-hidden">
      {/* 1. Top Action & Navigation Tabs */}
      <div className="p-3.5 border-b border-border bg-card/80 shrink-0 space-y-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewConsultation}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs hover:opacity-90 active:scale-98 transition-all"
            title={isHi ? 'नया संवाद शुरू करें' : 'Start a new consultation'}
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>{isHi ? 'नया संवाद' : 'New Chat'}</span>
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-[#651317]/10 dark:hover:bg-white/10 active:scale-95 transition-all"
            title={isHi ? 'इतिहास साफ करें' : 'Clear Chat History'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher: Kundli Snapshot vs History */}
        <div className="flex rounded-xl bg-surface p-1 border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('kundli')}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5",
              activeTab === 'kundli'
                ? "bg-card text-brand-primary dark:text-amber-400 shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{isHi ? 'जन्म कुण्डली' : 'Horoscope'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5",
              activeTab === 'history'
                ? "bg-card text-brand-primary dark:text-amber-400 shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{isHi ? 'संवाद इतिहास' : 'History'}</span>
            {sessions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-primary/10 text-brand-primary dark:text-amber-400">
                {sessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content (Hidden Scrollbar) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Tab 1: Birth Horoscope Sanctuary Details */}
        {activeTab === 'kundli' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-200">
            {/* Birth Chart Identity Header */}
            <div className="rounded-2xl bg-card border border-border p-3.5 shadow-2xs relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary dark:text-amber-400 border border-brand-primary/20">
                  {isHi ? 'सक्रिय जन्म कुण्डली' : 'Active Horoscope'}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {kundli.ayanamsa?.slice(0, 6) || 'Lahiri'}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground truncate">
                  {kundli.birthDetails.placeLabel}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  📅 {kundli.birthDetails.dateOfBirth}
                  {kundli.birthDetails.birthTime ? ` · ${kundli.birthDetails.birthTime}` : ''}
                </p>
              </div>
            </div>

            {/* 4 Pillars Snapshot */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                {isHi ? 'प्रमुख जन्म स्तंभ' : 'Key Birth Pillars'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Lagna */}
                <div className="rounded-xl bg-card border border-border p-2.5 flex flex-col justify-center shadow-2xs">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                    {isHi ? 'लग्न राशि' : 'Ascendant'}
                  </p>
                  <p className="text-xs sm:text-sm font-display font-bold text-brand-primary dark:text-amber-400 truncate mt-0.5">
                    {ascName}
                  </p>
                </div>

                {/* Moon Sign */}
                <div className="rounded-xl bg-card border border-border p-2.5 flex flex-col justify-center shadow-2xs">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                    {isHi ? 'चन्द्र राशि' : 'Moon Sign'}
                  </p>
                  <p className="text-xs sm:text-sm font-display font-bold text-brand-primary dark:text-amber-400 truncate mt-0.5">
                    {moonSign || '—'}
                  </p>
                </div>

                {/* Sun Sign */}
                <div className="rounded-xl bg-card border border-border p-2.5 flex flex-col justify-center shadow-2xs">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                    {isHi ? 'सूर्य राशि' : 'Sun Sign'}
                  </p>
                  <p className="text-xs sm:text-sm font-display font-bold text-foreground truncate mt-0.5">
                    {sunSign || '—'}
                  </p>
                </div>

                {/* Nakshatra */}
                <div className="rounded-xl bg-card border border-border p-2.5 flex flex-col justify-center shadow-2xs">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                    {isHi ? 'जन्म नक्षत्र' : 'Nakshatra'}
                  </p>
                  <p className="text-xs sm:text-sm font-display font-bold text-foreground truncate mt-0.5">
                    {nakshatra} (प.{nakPada})
                  </p>
                </div>
              </div>
            </div>

            {/* Active Dasha Card */}
            <div className="rounded-xl bg-card border border-border p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {isHi ? 'सक्रिय महादशा चक्र' : 'Active Dasha'}
                </span>
                <span className="font-bold text-brand-primary dark:text-amber-400 text-xs">
                  {currentMD} · {currentAD}
                </span>
              </div>

              <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-border">
                <div
                  className="bg-brand-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, dashaProgress))}%` }}
                />
              </div>
            </div>

            {/* Ishta Devata & Sadhana */}
            <div className="rounded-xl bg-card border border-border p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-brand-primary dark:text-amber-400 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isHi ? 'इष्ट देव साधना' : 'Ishta Devata Sadhana'}</span>
              </div>

              <div>
                <p className="text-sm font-display font-bold text-foreground">
                  {ishtaName || (isHi ? 'प्रभु श्री राम' : 'Lord Rama')}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate select-all">
                  {ishtaMantra}
                </p>
              </div>
            </div>

            {/* Dosha Status */}
            <div className="rounded-xl bg-card border border-border p-2.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                {hasDosha ? (
                  <Flame className="h-4 w-4 text-amber-600 shrink-0" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span className="text-xs font-semibold text-foreground">
                  {isHi ? 'मंगल दोष समीक्षा' : 'Mangal Dosha'}
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  hasDosha
                    ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                }`}
              >
                {hasDosha ? (isHi ? 'सामान्य प्रभाव' : 'Active') : (isHi ? 'दोष मुक्त' : 'No Dosha')}
              </span>
            </div>

            {/* Jump to Full Kundli with Natural Creamy Hover */}
            <button
              type="button"
              onClick={() => navigate('/kundli')}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-[#651317]/10 dark:hover:bg-white/10 hover:text-brand-primary dark:hover:text-amber-300 px-3 py-2.5 text-xs font-medium text-foreground transition-all cursor-pointer"
            >
              <span>{isHi ? 'सम्पूर्ण कुण्डली रिपोर्ट देखें' : 'View Full Kundli Report'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tab 2: Chat History Sessions List */}
        {activeTab === 'history' && (
          <div className="space-y-2 animate-in fade-in-50 duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1.5">
              {isHi ? 'पिछले संवाद सत्र' : 'Past Consultations'}
            </p>

            {sessions.length === 0 ? (
              <div className="p-4 rounded-xl border border-border text-center text-xs text-muted-foreground space-y-1">
                <p>{isHi ? 'कोई पिछला संवाद नहीं मिला।' : 'No past consultations found.'}</p>
                <p className="text-[11px]">{isHi ? 'नया प्रश्न पूछकर संवाद शुरू करें।' : 'Ask a question to start.'}</p>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const formattedDate = new Date(session.updatedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all cursor-pointer",
                      isActive
                        ? "bg-brand-primary/10 border-brand-primary/40 text-brand-primary dark:text-amber-300 shadow-2xs font-semibold"
                        : "bg-card border-border hover:border-brand-primary/30 hover:bg-[#651317]/5 dark:hover:bg-white/5 text-foreground"
                    )}
                    onClick={() => onSelectSession?.(session.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate font-medium">{session.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formattedDate}</p>
                    </div>

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex items-center justify-center transition-opacity"
                        title={isHi ? 'सत्र हटाएं' : 'Delete session'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export const GuruJiKundliSidebar = memo(GuruJiKundliSidebarInner);
