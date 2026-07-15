import { Search, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export function SearchCard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div 
      onClick={() => navigate('/search')}
      className="w-full h-[50px] flex items-center bg-white dark:bg-[#1E1710] border border-[#E8D8C4] dark:border-zinc-800/80 rounded-[24px] shadow-[0_6px_14px_rgba(0,0,0,0.04)] px-[16px] cursor-pointer transition-all active:scale-[0.99]"
    >
      <Search className="w-5 h-5 text-[#651317] shrink-0 mr-3" />
      <span className="flex-1 text-left text-sm text-[#3A2418]/60 dark:text-muted-foreground/60 select-none truncate">
        {isHi ? "भजन, कीर्तन या कलाकार खोजें..." : "Search bhajans, kirtans or artists..."}
      </span>
      <Mic className="h-5 w-5 text-[#651317] shrink-0 ml-2" />
    </div>
  );
}
