import { Check, ChevronRight, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/community/communityApi";
import { CommunityCoverImage } from "@/components/community/CommunityMedia";
import mandalaGold from "@/pages/images/mandala-gold.svg";
import mandalaBeige from "@/pages/images/mandala-beige.svg";

const DEITY_LABELS: Record<string, { en: string; hi: string }> = {
  rama: { en: "Ram Ji", hi: "श्री राम जी" },
  hanuman: { en: "Hanuman Ji", hi: "श्री हनुमान जी" },
  krishna: { en: "Krishna Ji", hi: "श्री कृष्ण जी" },
  shiva: { en: "Shiva Ji", hi: "शिव जी" },
  ganesh: { en: "Ganesh Ji", hi: "गणेश जी" },
  durga: { en: "Durga Ma", hi: "दुर्गा माँ" },
  lakshmi: { en: "Lakshmi Ma", hi: "लक्ष्मी माँ" },
  "sai-baba": { en: "Sai Baba", hi: "साईं बाबा" },
};

export function getDeityDisplayName(deityId: string | undefined, isHi: boolean, fallback = "") {
  if (!deityId) return fallback;
  const mapped = DEITY_LABELS[deityId.toLowerCase()];
  if (mapped) return isHi ? mapped.hi : mapped.en;
  return fallback || deityId;
}

export function isValidGroupImageUrl(url?: string | null) {
  if (!url || !url.trim() || url === "null" || url === "undefined") return false;
  return url.startsWith("http") || url.startsWith("/") || url.startsWith("data:");
}

const PRIMARY_BTN =
  "h-10 min-h-10 px-4 rounded-xl text-sm font-extrabold inline-flex items-center justify-center gap-1.5 bg-[#651317] hover:bg-[#4f0f12] text-white";
const SECONDARY_BTN =
  "h-10 min-h-10 px-4 rounded-xl text-sm font-extrabold inline-flex items-center justify-center gap-1.5 border border-[#E8D8C4] dark:border-stone-700 bg-background";

type CommunityGroupCardProps = {
  group: Group;
  isHi: boolean;
  coverSrc: string;
  avatarSrc: string;
  deityLabel: string;
  variant: "joined" | "explore";
  priority?: boolean;
  onOpen: () => void;
  onJoin?: () => void;
};

export function CommunityGroupCard({
  group,
  isHi,
  coverSrc,
  avatarSrc,
  deityLabel,
  variant,
  priority,
  onOpen,
  onJoin,
}: CommunityGroupCardProps) {
  const isExplore = variant === "explore";

  return (
    <div
      className={
        isExplore
          ? "group relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-md"
          : "card-interactive relative flex min-h-[290px] flex-col justify-between overflow-hidden text-left"
      }
    >
      <div className="relative">
        <CommunityCoverImage src={coverSrc} alt={group.name} priority={priority} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        {isExplore && (
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold text-white/95 backdrop-blur-md ${
              group.is_public ? "bg-emerald-600/70" : "bg-rose-700/70"
            }`}
          >
            <Globe className="h-2.5 w-2.5" />
            {group.is_public ? (isHi ? "सार्वजनिक" : "Public") : isHi ? "निजी" : "Private"}
          </span>
        )}
        {!isExplore && (
          <div className="absolute bottom-0 left-5 z-20 translate-y-1/2">
            <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-background bg-background p-0.5 shadow-md">
              <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover" />
            </div>
          </div>
        )}
      </div>

      <div
        className={`pointer-events-none absolute bottom-0 right-0 z-0 h-28 w-28 translate-x-6 translate-y-6 ${
          isExplore ? "opacity-[0.06] dark:opacity-[0.03]" : "opacity-[0.16] dark:opacity-[0.08]"
        }`}
      >
        <img src={isExplore ? mandalaBeige : mandalaGold} className="h-full w-full object-contain" alt="" />
      </div>

      <div className={`relative z-10 flex flex-1 flex-col justify-between space-y-4 px-5 pb-5 ${isExplore ? "pt-5" : "pt-12"}`}>
        <div className="space-y-2">
          {isExplore && deityLabel ? (
            <span className="inline-block rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand-gold">
              {deityLabel}
            </span>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-display text-base font-extrabold leading-snug text-brand-primary dark:text-amber-100">
              {group.name}
            </h3>
            {!isExplore && deityLabel ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-brand-gold">
                {deityLabel}
              </span>
            ) : null}
          </div>

          <p className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
            {group.member_count} {isHi ? "भक्त जुड़े हैं" : isExplore ? "Members" : "devotees joined"}
          </p>
          <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
            {group.description ||
              (isHi
                ? "भक्तिमय संगीत और नाम जाप साझा करने का स्थान।"
                : "A space for sharing devotional music and chanting.")}
          </p>
        </div>

        {isExplore ? (
          <div className="mt-2 flex gap-2 border-t border-border pt-3">
            {group.is_member ? (
              <>
                <Button onClick={onOpen} className={`${PRIMARY_BTN} flex-1`}>
                  {isHi ? "समूह देखें" : "View Group"}
                </Button>
                <Button variant="outline" onClick={onJoin} className={`${SECONDARY_BTN} flex-1 text-rose-600`}>
                  <Check className="h-3.5 w-3.5" />
                  {isHi ? "शामिल हैं" : "Joined"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onOpen} className={`${SECONDARY_BTN} flex-1`}>
                  {isHi ? "विवरण देखें" : "Details"}
                </Button>
                <Button onClick={onJoin} className={`${PRIMARY_BTN} flex-1`}>
                  <Plus className="h-3.5 w-3.5" />
                  {isHi ? "शामिल हों" : "Join"}
                </Button>
              </>
            )}
          </div>
        ) : (
          <button type="button" onClick={onOpen} className={`${PRIMARY_BTN} w-full`}>
            <span>{isHi ? "समूह देखें" : "See Group"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
