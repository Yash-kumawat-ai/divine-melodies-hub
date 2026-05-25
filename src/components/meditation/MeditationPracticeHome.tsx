import { Flower2, Moon, Wind, Sparkles, Play, Flame, BookOpen } from "lucide-react";
import { OM } from "@/lib/meditation/unicode";
import {
  getPracticeById,
  QUICK_PRACTICE,
  type MeditationPractice,
  type PracticeType,
} from "@/lib/meditation/meditationTypes";
import { computeStats, loadSessionLogs, loadPreferences } from "@/lib/meditation/meditationStorage";
import { cn } from "@/lib/utils";

const ENTRY: { type: PracticeType; label: string; desc: string; icon: typeof Flower2; color: string }[] = [
  { type: "mantra", label: "Mantra Japa", desc: "Sacred names · mala count", icon: Flower2, color: "from-amber-600/30" },
  { type: "breath", label: "Breath", desc: "Pranayama pacing", icon: Wind, color: "from-orange-500/25" },
  { type: "sleep", label: "Sleep", desc: "Rest · dim visuals", icon: Moon, color: "from-indigo-600/30" },
  { type: "focus", label: "Focus", desc: "Clarity · interval bells", icon: Sparkles, color: "from-rose-500/20" },
];

type MeditationPracticeHomeProps = {
  onSelectPractice: (practice: MeditationPractice) => void;
  onQuickStart: () => void;
};

export default function MeditationPracticeHome({ onSelectPractice, onQuickStart }: MeditationPracticeHomeProps) {
  const stats = computeStats(loadSessionLogs());
  const prefs = loadPreferences();
  const lastPractice = prefs.lastPracticeId ? getPracticeById(prefs.lastPracticeId) : null;

  return (
    <div
      className="px-4 py-6 md:py-10"
      style={{
        background: "radial-gradient(circle at 50% 0%, #2d1200 0%, #090011 42%, #000 100%)",
      }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-amber-50">Dhyan · Practice</h1>
            <p className="mt-2 text-sm md:text-base text-amber-200/65">
              Distraction-free devotional meditation — no account required.
            </p>
          </div>
          <span className="font-display text-4xl md:text-5xl text-amber-100/80 shrink-0" aria-hidden>
            {OM}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-amber-400/15 bg-black/35 px-4 py-4 backdrop-blur-md md:gap-6 md:px-6 md:py-5">
          <div className="flex-1 text-center">
            <p className="font-mono text-lg md:text-xl text-amber-50">{stats.totalMindfulMinutes}</p>
            <p className="text-[10px] md:text-xs text-amber-200/50 mt-1">Mindful min</p>
          </div>
          <div className="w-px bg-amber-400/15" />
          <div className="flex-1 text-center">
            <p className="font-mono text-lg md:text-xl text-amber-50">{stats.streakDays}</p>
            <p className="text-[10px] md:text-xs text-amber-200/50 mt-1">Day streak</p>
          </div>
          <div className="w-px bg-amber-400/15" />
          <div className="flex-1 text-center">
            <p className="font-mono text-lg md:text-xl text-amber-50">{stats.sessionCount}</p>
            <p className="text-[10px] md:text-xs text-amber-200/50 mt-1">Sessions</p>
          </div>
        </div>

        {lastPractice && (
          <button
            type="button"
            onClick={onQuickStart}
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-700/40 to-orange-800/30 px-4 md:px-6 py-3 md:py-4 text-left transition-transform active:scale-[0.99] hover:border-amber-400/50"
          >
            <Play className="h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="text-sm md:text-base font-semibold text-amber-50">Continue last practice</p>
              <p className="text-xs md:text-sm text-amber-200/70">{lastPractice.title}</p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectPractice(QUICK_PRACTICE)}
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 md:py-3 text-xs md:text-sm font-medium text-amber-100/80 hover:bg-white/10 transition-colors"
        >
          I have 2 minutes
        </button>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ENTRY.map((e) => {
            const Icon = e.icon;
            return (
              <button
                key={e.type}
                type="button"
                onClick={() => {
                  const p =
                    e.type === "mantra"
                      ? getPracticeById("mantra_shiva")!
                      : e.type === "breath"
                        ? getPracticeById("breath_box")!
                        : e.type === "sleep"
                          ? getPracticeById("sleep_rest")!
                          : getPracticeById("focus_clarity")!;
                  onSelectPractice(p);
                }}
                className={cn(
                  "rounded-2xl border border-amber-400/15 bg-gradient-to-br p-4 md:p-5 text-left transition-transform active:scale-[0.98] hover:border-amber-400/25",
                  e.color,
                )}
              >
                <Icon className="h-6 w-6 md:h-7 md:w-7 text-amber-200/90" />
                <p className="mt-3 font-medium text-amber-50 md:text-base">{e.label}</p>
                <p className="text-[11px] md:text-xs text-amber-200/55">{e.desc}</p>
              </button>
            );
          })}
        </div>

        <section className="mt-8 md:mt-10">
          <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-200/50">
            <Flame className="h-3.5 w-3.5" /> Deity journeys
          </h2>
          <div className="mt-3 flex md:grid md:grid-cols-2 gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
            {(["mantra_shiva", "mantra_krishna", "mantra_ram", "mantra_narayana"] as const).map((id) => {
              const p = getPracticeById(id);
              if (!p) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectPractice(p)}
                  className="shrink-0 md:shrink w-auto md:w-full rounded-full md:rounded-2xl border border-amber-400/20 bg-black/40 px-4 py-2 md:px-4 md:py-3 text-xs md:text-sm text-amber-100 hover:border-amber-400/40 transition-colors"
                >
                  {p.deityJourney}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 md:mt-10 rounded-2xl border border-amber-400/10 bg-black/30 p-4 md:p-6">
          <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-200/50">
            <BookOpen className="h-3.5 w-3.5" /> Divine coach
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed text-amber-100/75">
            Begin with one mantra, steady breath, and gentle awareness. This is devotional practice — not medical
            advice. For deeper teachings, explore Kirtan AI when you are ready.
          </p>
        </section>
      </div>
    </div>
  );
}
