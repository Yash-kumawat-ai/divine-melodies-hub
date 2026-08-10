import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { LiveAartiIcon } from '@/components/LiveAartiIcon';

export function ActionButtons() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="w-full grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={() => navigate('/all-bhajans')}
        className="btn-royal-primary w-full min-w-0 h-11 sm:h-12 rounded-2xl !px-2.5 text-[12px] sm:text-sm font-semibold gap-1.5"
      >
        <Play className="!w-3.5 !h-3.5 fill-current stroke-none shrink-0" />
        <span className="truncate leading-tight">{isHi ? 'भजन खोजें' : 'Explore Bhajans'}</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/live-aarti')}
        className="btn-royal-secondary w-full min-w-0 h-11 sm:h-12 rounded-2xl !px-2.5 text-[12px] sm:text-sm font-semibold gap-1.5 !bg-[#FFFDF8] hover:!bg-[#FFFDF8] dark:!bg-[#1A120B] dark:hover:!bg-[#1A120B]"
      >
        <LiveAartiIcon className="!h-5 !w-5" />
        <span className="truncate leading-tight">{isHi ? 'लाइव आरती' : 'Live Aarti'}</span>
      </button>
    </div>
  );
}
