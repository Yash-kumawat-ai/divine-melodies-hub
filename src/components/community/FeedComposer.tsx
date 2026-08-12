import { Music, HelpCircle, Leaf, Calendar } from "lucide-react";

type PostTypeId = "bhajan_share" | "bhajan_request" | "thought" | "event";

interface FeedComposerProps {
  isHi: boolean;
  user: { photoURL?: string | null; displayName?: string | null } | null;
  onOpenCompose: (type?: PostTypeId) => void;
}

const POST_ACTIONS: {
  id: PostTypeId;
  icon: typeof Music;
  labelEn: string;
  labelHi: string;
}[] = [
  { id: "bhajan_share", icon: Music, labelEn: "Bhajan", labelHi: "भजन" },
  { id: "bhajan_request", icon: HelpCircle, labelEn: "Request", labelHi: "अनुरोध" },
  { id: "thought", icon: Leaf, labelEn: "Thought", labelHi: "विचार" },
  { id: "event", icon: Calendar, labelEn: "Event", labelHi: "कार्यक्रम" },
];

export function FeedComposer({ isHi, user, onOpenCompose }: FeedComposerProps) {
  const initials = user?.displayName?.slice(0, 2).toUpperCase() || "DV";

  return (
    <div className="rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#1A120B] p-3.5 shadow-xs space-y-3">
      <button
        type="button"
        onClick={() => onOpenCompose()}
        className="flex items-center gap-3 w-full text-left group"
      >
        <div className="w-10 h-10 rounded-full ring-2 ring-[#E8D8C4] dark:ring-stone-700 bg-[#FAF0E4] dark:bg-stone-800 flex items-center justify-center text-[#651317] dark:text-amber-300 font-extrabold text-sm shrink-0 overflow-hidden shadow-xs">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="flex-1 text-left text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium py-2.5 px-4 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 group-hover:bg-[#FAF6EE] dark:group-hover:bg-stone-800 transition-colors shadow-2xs">
          {isHi ? "यहाँ विचार, भजन या प्रश्न साझा करें..." : "Share thoughts, bhajans, or ask a question..."}
        </span>
      </button>

      <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#E8D8C4]/60 dark:border-stone-800/80">
        {POST_ACTIONS.map(({ id, icon: Icon, labelEn, labelHi }) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpenCompose(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-[#651317] dark:hover:text-amber-300 hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-all text-xs font-extrabold border border-transparent hover:border-[#E8D8C4]"
          >
            <Icon className="w-4 h-4 text-[#651317] dark:text-amber-400 shrink-0" />
            <span className="truncate">{isHi ? labelHi : labelEn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default FeedComposer;
