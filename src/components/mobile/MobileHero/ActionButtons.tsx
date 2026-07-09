import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function ActionButtons() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="w-full mt-[12px] grid grid-cols-2 gap-[12px]">
      <button 
        onClick={() => navigate('/all-bhajans')}
        className="h-[48px] rounded-full bg-gradient-to-r from-[#FF9A1F] to-[#F97316] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(249,115,22,0.2)] active:scale-95 transition-transform"
      >
        <Play className="w-4.5 h-4.5 fill-white stroke-none" />
        <span>{isHi ? 'भजन खोजें' : 'Bhajan Search'}</span>
      </button>
      
      <button 
        onClick={() => navigate('/live-aarti')}
        className="h-[48px] rounded-full bg-[#2C1810] text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <span className="relative flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-600 border border-white/30 shadow-inner shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        <span>{isHi ? 'लाइव दर्शन' : 'Live Darshan'}</span>
      </button>
    </div>
  );
}
