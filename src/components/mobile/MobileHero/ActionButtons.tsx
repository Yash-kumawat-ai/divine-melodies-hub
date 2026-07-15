import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function ActionButtons() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="w-full grid grid-cols-2 gap-[12px]">
      <button 
        onClick={() => navigate('/all-bhajans')}
        className="btn-royal-primary h-[48px] rounded-[16px] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(74,14,18,0.1)] active:scale-95 transition-all"
      >
        <Play className="w-4.5 h-4.5 fill-white stroke-none text-white" />
        <span>{isHi ? 'भजन खोजें' : 'Bhajan Search'}</span>
      </button>
      
      <button 
        onClick={() => navigate('/live-aarti')}
        className="btn-royal-secondary h-[48px] rounded-[16px] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(74,14,18,0.03)] active:scale-95 transition-all"
      >
        <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-rose-700/20 border border-rose-700/30 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#651317] animate-pulse" />
        </span>
        <span>{isHi ? 'लाइव दर्शन' : 'Live Darshan'}</span>
      </button>
    </div>
  );
}
