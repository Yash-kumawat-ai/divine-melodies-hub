import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Loader2, Search, ChevronRight } from 'lucide-react';
import { Deity, useDeities, deduplicateDeities } from '@/hooks/useDeities';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/ui/input';

interface DeitySelectProps {
  onDeitySelect: (deity: Deity) => void;
  onAddNewDeity: () => void;
}

// Qualities / Attributes map for each deity
const DEITY_ATTRIBUTES: Record<string, string> = {
  krishna: 'प्रेम • करुणा • भक्ति • लीलाएँ',
  shiva: 'वैराग्य • शक्ति • कल्याण',
  hanuman: 'सेवा • बल • साहस • भक्ति',
  rama: 'मर्यादा • धर्म • सत्य • आदर्श',
  durga: 'शक्ति • सुरक्षा • विजय • कृपा',
  ganesh: 'रिद्धि-सिद्धि • बुद्धि • मंगल',
  'sai-baba': 'श्रद्धा • सबुरी • सेवा • करुणा',
  lakshmi: 'समृद्धि • वैभव • कृपा • श्री',
  'khatu-shyam': 'हारे का सहारा • दयालु • भक्तवत्सल',
};

export default function DeitySelector({ onDeitySelect, onAddNewDeity }: DeitySelectProps) {
  const { deities: rawDeities, loading } = useDeities();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [selectedDeityId, setSelectedDeityId] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Deduplicate deities array to ensure no duplicates (like Khatu Shyam) ever appear
  const deities = useMemo(() => deduplicateDeities(rawDeities), [rawDeities]);

  // Filter by search query
  const filteredDeities = useMemo(() => {
    if (!searchQuery.trim()) return deities;
    const q = searchQuery.toLowerCase().trim();
    return deities.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.nameHindi && d.nameHindi.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [deities, searchQuery]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-16">
        <Loader2 className="w-9 h-9 animate-spin text-[#7A2D28] dark:text-[#E8B15C] mb-3" />
        <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] font-medium">
          {isHi ? 'भगवान की सूची लोड हो रही है...' : 'Loading deities list...'}
        </p>
      </div>
    );
  }

  const handleCardClick = (deity: Deity) => {
    setSelectedDeityId(deity.id || deity.name);
    setTimeout(() => {
      onDeitySelect(deity);
    }, 220);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Step Header Title */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/40 text-[#6A2C2A] dark:text-[#E8B15C] text-xs font-bold mb-3 shadow-sm">
          <span>✨ Step 2 of 4</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#32251E] dark:text-[#FFFDF8]">
          {isHi ? 'भगवान / देवी का चयन करें' : 'Select Deity'}
        </h2>
        <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm mt-1.5 leading-relaxed max-w-lg mx-auto">
          {isHi
            ? 'भजन एवं रचना के लिए अपने आराध्य चुनें और अपनी भक्ति साझा करें'
            : 'Select your worshipped deity for this devotional content'}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isHi ? 'भगवान का नाम खोजें (उदा: कृष्ण, हनुमान, खाटू श्याम)...' : 'Search deity name...'}
          className="pl-10 h-11 bg-white dark:bg-[#1E1710] border-[#EFE4D7] dark:border-zinc-800 rounded-xl text-sm shadow-sm"
        />
      </div>

      {/* Responsive Grid Layout (1 col mobile, 2 cols desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {filteredDeities.map((deity, idx) => {
          const isSelected = selectedDeityId === (deity.id || deity.name);
          const slugKey = deity.slug || deity.name.toLowerCase().replace(/\s+/g, '-');
          const attributes =
            DEITY_ATTRIBUTES[slugKey] || deity.description || (isHi ? 'भक्ति • कृपा • दर्शन' : 'Devotion & Grace');

          return (
            <motion.div
              key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id || deity.name}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleCardClick(deity)}
              className={`group relative cursor-pointer rounded-2xl p-3.5 sm:p-4 border-2 transition-all duration-200 select-none overflow-hidden flex items-center justify-between gap-3 sm:gap-4 ${
                isSelected
                  ? 'bg-[#FAF2E8] dark:bg-[#251A10] border-[#7A2D28] dark:border-[#E8B15C] shadow-md ring-2 ring-[#7A2D28]/15 dark:ring-[#E8B15C]/20'
                  : 'bg-white dark:bg-[#1E1710] border-[#EFE4D7] dark:border-zinc-800/80 hover:border-[#D4A44A]/70 hover:bg-[#FCF8F2] dark:hover:bg-[#251A10] shadow-sm'
              }`}
            >
              {/* Left Deity Image Thumbnail */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-sm border border-[#EFE4D7] dark:border-zinc-800 bg-[#FAF2E8] dark:bg-amber-950/30 flex items-center justify-center">
                {deity.imageUrl ? (
                  <img
                    src={deity.imageUrl}
                    alt={deity.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                    {deity.emoji}
                  </span>
                )}

                {deity.isCustom && (
                  <span className="absolute top-1 left-1 text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#7A2D28] text-white rounded-md shadow-sm">
                    New
                  </span>
                )}
              </div>

              {/* Center Info */}
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#32251E] dark:text-[#FFFDF8] leading-tight break-words">
                  {isHi ? deity.nameHindi || deity.name : deity.name}
                </h3>

                {/* Decorative underline */}
                <div className="h-0.5 w-10 bg-gradient-to-r from-[#D4A44A] to-transparent my-1 opacity-80" />

                {/* Qualities / Attributes */}
                <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] leading-relaxed font-medium line-clamp-2">
                  {attributes}
                </p>
              </div>

              {/* Right Selection Circle */}
              <div className="shrink-0">
                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-[#5A1F1A] dark:bg-[#E8B15C] text-white dark:text-zinc-950 flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#D8C9B9] dark:border-zinc-700 group-hover:border-[#D4A44A] transition-colors" />
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Add Custom Deity Card — Spans 2 cols on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onAddNewDeity}
          className="group relative cursor-pointer rounded-2xl p-4 border-2 border-dashed border-[#D4A44A]/60 dark:border-amber-900/60 bg-white/70 dark:bg-[#1E1710]/70 hover:bg-[#FAF2E8] dark:hover:bg-[#251A10] hover:border-[#7A2D28] dark:hover:border-[#E8B15C] transition-all duration-200 select-none flex items-center justify-between gap-4 shadow-sm md:col-span-2"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/50 flex items-center justify-center text-[#7A2D28] dark:text-[#E8B15C] shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#32251E] dark:text-[#FFFDF8]">
                {isHi ? '+ नया भगवान / देवी जोड़ें' : '+ Add Custom Deity'}
              </h4>
              <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] mt-0.5">
                {isHi
                  ? 'यदि आपका देवता सूची में नहीं है तो यहां क्लिक करके जोड़ें'
                  : 'If your worshipped deity is not listed above, click here to add'}
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[#7A6B60] dark:text-[#D4C5B9] group-hover:translate-x-1 transition-transform shrink-0" />
        </motion.div>
      </div>

      {filteredDeities.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-[#1E1710] rounded-2xl border border-dashed border-[#EFE4D7] dark:border-zinc-800 p-6">
          <p className="text-sm text-muted-foreground mb-3">
            {isHi ? 'कोई देवता नहीं मिला' : 'No deity found matching your search'}
          </p>
          <button
            onClick={onAddNewDeity}
            className="px-4 py-2 rounded-xl bg-[#7A2D28] text-white text-xs font-bold hover:bg-[#5A1F1A] transition-colors"
          >
            {isHi ? '+ नया भगवान जोड़ें' : '+ Add Custom Deity'}
          </button>
        </div>
      )}
    </div>
  );
}
