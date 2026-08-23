import { ArrowLeft, ChevronLeft } from "lucide-react";
import { goBack } from "@/lib/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface MobileBackButtonProps {
  className?: string;
  fallbackPath?: string;
  onBack?: () => void;
  showLabel?: boolean;
}

export default function MobileBackButton({
  className,
  fallbackPath = "/",
  onBack,
  showLabel = true,
}: MobileBackButtonProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    onBack?.();
    goBack(navigate, fallbackPath);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-primary/25 bg-background/85 px-2.5 py-2 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all hover:-translate-x-0.5 hover:border-primary/45 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 active:scale-95 touch-target sm:px-3.5 sm:py-2.5",
        className,
      )}
      aria-label={t("back")}
      title={t("back")}
    >
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <ChevronLeft className="h-4 w-4 sm:hidden" strokeWidth={2.7} />
        <ArrowLeft className="hidden h-4 w-4 sm:block" strokeWidth={2.5} />
      </span>
      {showLabel && (
        <span className="hidden max-w-[5.5rem] truncate leading-none min-[390px]:inline sm:max-w-[7rem]">
          {t("back")}
        </span>
      )}
    </button>
  );
}
