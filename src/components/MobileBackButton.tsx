import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary/20 px-2.5 py-2 text-sm font-bold text-primary shadow-md hover:bg-primary hover:text-primary-foreground transition-colors touch-target shrink-0 min-h-[44px] min-w-[44px] sm:px-3 sm:py-2.5",
        className,
      )}
      aria-label={t("back")}
    >
      <ArrowLeft className="w-5 h-5 shrink-0" strokeWidth={2.5} />
      {showLabel && <span className="hidden min-[400px]:inline">{t("back")}</span>}
    </button>
  );
}
