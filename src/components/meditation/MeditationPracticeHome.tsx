import { BookOpen, Clock3, Flame, Flower2, Moon, Play, Sparkles, Timer, Wind } from "lucide-react";
import { deities } from "@/data/bhajans";
import { useLanguage } from "@/hooks/useLanguage";
import { getMeditationCopy, getMeditationPracticeTitle } from "@/lib/meditation/meditationLocale";
import { OM } from "@/lib/meditation/unicode";
import {
  getPracticeById,
  QUICK_PRACTICE,
  type MeditationPractice,
  type PracticeType,
} from "@/lib/meditation/meditationTypes";
import { computeStats, loadPreferences, loadSessionLogs } from "@/lib/meditation/meditationStorage";
import { cn } from "@/lib/utils";

const ENTRY: { type: PracticeType; label: string; desc: string; icon: typeof Flower2; color: string }[] = [
  { type: "mantra", label: "mantra", desc: "mantra", icon: Flower2, color: "from-amber-500/30 to-orange-600/10" },
  { type: "breath", label: "breath", desc: "breath", icon: Wind, color: "from-sky-500/25 to-teal-500/10" },
  { type: "sleep", label: "sleep", desc: "sleep", icon: Moon, color: "from-indigo-500/25 to-violet-500/10" },
  { type: "focus", label: "focus", desc: "focus", icon: Sparkles, color: "from-rose-500/25 to-amber-500/10" },
];

const JOURNEY_IDS = ["mantra_shiva", "mantra_krishna", "mantra_radhe", "mantra_ram", "mantra_narayana"] as const;

type MeditationPracticeHomeProps = {
  onSelectPractice: (practice: MeditationPractice) => void;
  onQuickStart: () => void;
};

function deityForPractice(practice: MeditationPractice) {
  const slug =
    practice.mantraId === "jai_shree_ram"
      ? "rama"
      : practice.mantraId === "hare_krishna" || practice.mantraId === "radhe_radhe"
        ? "krishna"
        : practice.mantraId === "om_namo_narayanaya"
          ? "lakshmi"
          : "shiva";
  return deities.find((d) => d.slug === slug);
}

export default function MeditationPracticeHome({ onSelectPractice, onQuickStart }: MeditationPracticeHomeProps) {
  const { language } = useLanguage();
  const copy = getMeditationCopy(language);
  const stats = computeStats(loadSessionLogs());
  const prefs = loadPreferences();
  const lastPractice = prefs.lastPracticeId ? getPracticeById(prefs.lastPracticeId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f08] via-[#0c0608] to-[#050306] px-4 pb-28 pt-4 text-amber-50 md:pb-12 md:pt-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,146,60,0.18),transparent),radial-gradient(circle_at_90%_20%,rgba(244,63,94,0.08),transparent_40%)]" />

      <div className="mx-auto max-w-5xl space-y-5 md:space-y-7">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-amber-200/20 bg-gradient-to-br from-amber-950/40 via-black/50 to-black/60 shadow-xl shadow-black/40 backdrop-blur-md">
          <div className="border-b border-amber-200/10 px-5 py-4 md:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-100/90">
              <Flower2 className="h-3.5 w-3.5 text-amber-300" />
              {copy.home.badge}
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-amber-50 sm:text-4xl md:text-5xl">
              {copy.home.title}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-amber-100/75 md:text-base">
              {copy.home.subtitle}
            </p>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-8">
            <div className="order-2 space-y-4 md:order-1">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: copy.home.minutes, value: stats.totalMindfulMinutes, icon: Clock3 },
                  { label: copy.home.streak, value: stats.streakDays, icon: Flame },
                  { label: copy.home.sessions, value: stats.sessionCount, icon: Timer },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center rounded-2xl border border-amber-200/15 bg-black/30 px-2 py-3"
                    >
                      <Icon className="mb-1 h-4 w-4 text-amber-400/80" aria-hidden />
                      <p className="font-mono text-2xl font-semibold tabular-nums text-amber-50">{item.value}</p>
                      <p className="mt-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-amber-200/50">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={lastPractice ? onQuickStart : () => onSelectPractice(getPracticeById("mantra_shiva")!)}
                  className="flex min-h-[3.25rem] flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-left font-semibold text-[#2a1208] shadow-lg shadow-orange-950/40 transition active:scale-[0.99]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/15">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                  <span className="min-w-0 flex-1">
                    {lastPractice ? (
                      <>
                        <span className="block text-sm leading-tight">{copy.home.continueSuffix}</span>
                        <span className="block truncate text-xs font-medium opacity-90">
                          {getMeditationPracticeTitle(lastPractice, language)}
                        </span>
                      </>
                    ) : (
                      <span className="block text-sm">{copy.home.beginJapa}</span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPractice(QUICK_PRACTICE)}
                  className="min-h-[3.25rem] rounded-2xl border border-amber-200/25 bg-amber-500/10 px-5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 active:scale-[0.99] sm:shrink-0"
                >
                  {copy.home.quickPause}
                </button>
              </div>
            </div>

            <div className="order-1 flex justify-center md:order-2">
              <div className="relative flex aspect-square w-[11rem] items-center justify-center sm:w-[12.5rem] md:w-[14rem]">
                <div className="absolute inset-0 rounded-full border border-amber-300/15" />
                <div className="absolute inset-3 rounded-full border border-amber-200/10" />
                <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.2),transparent_65%)]" />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-amber-200/30 bg-gradient-to-br from-amber-950/80 to-black/60 font-display text-6xl text-amber-100 shadow-inner shadow-amber-950/50 sm:h-32 sm:w-32 sm:text-7xl">
                  {OM}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Practice types */}
        <section>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-amber-200/55">
            {copy.home.chooseNaam}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ENTRY.map((e) => {
              const Icon = e.icon;
              const entryCopy = copy.entry[e.type];
              const practice =
                e.type === "mantra"
                  ? getPracticeById("mantra_shiva")!
                  : e.type === "breath"
                    ? getPracticeById("breath_box")!
                    : e.type === "sleep"
                      ? getPracticeById("sleep_rest")!
                      : getPracticeById("focus_clarity")!;

              return (
                <button
                  key={e.type}
                  type="button"
                  onClick={() => onSelectPractice(practice)}
                  className={cn(
                    "group flex min-h-[7.5rem] flex-col rounded-2xl border border-amber-200/15 bg-gradient-to-br p-4 text-left shadow-md shadow-black/25 transition active:scale-[0.98] hover:border-amber-300/35",
                    e.color,
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-auto pt-3 text-sm font-semibold leading-snug text-amber-50">{entryCopy.label}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-4 text-amber-100/60">{entryCopy.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Deity journeys — horizontal scroll on mobile */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200/55">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              {copy.home.deityJourneys}
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {JOURNEY_IDS.map((id) => {
              const practice = getPracticeById(id);
              if (!practice) return null;
              const deity = deityForPractice(practice);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectPractice(practice)}
                  className="group flex w-[9.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-amber-200/15 bg-black/35 text-left shadow-md transition active:scale-[0.98] hover:border-amber-300/30 md:w-auto"
                >
                  {deity?.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                      <img
                        src={deity.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                  ) : null}
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-amber-50">
                      {getMeditationPracticeTitle(practice, language)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-amber-100/55">
                      {practice.type === "mantra" ? copy.home.mantraDesc : copy.home.guidedDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Practice note */}
        <section className="rounded-2xl border border-amber-200/12 bg-amber-500/5 p-4 md:p-5">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200/55">
            <BookOpen className="h-3.5 w-3.5" />
            {copy.home.practiceNote}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-100/70">{copy.home.practiceNoteBody}</p>
        </section>
      </div>
    </div>
  );
}
