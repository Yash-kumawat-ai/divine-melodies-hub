import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Flame, Scroll, BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';

export interface ContentCategory {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  icon: any;
  gradient: string;
  emoji: string;
  isCustom?: boolean;
}

interface CategorySelectorProps {
  onCategorySelect: (category: ContentCategory, customName?: string) => void;
}

export function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customNameInput, setCustomNameInput] = useState('');
  const [customError, setCustomError] = useState('');

  const categories: ContentCategory[] = [
    {
      id: 'bhajan',
      name: 'Bhajan & Kirtan',
      nameHindi: 'भजन एवं संकीर्तन',
      description: 'Devotional songs, kirtans & pads of deities',
      descriptionHindi: 'भगवान के मधुर भजन, संकीर्तन एवं पद',
      icon: Music,
      gradient: 'from-amber-500 to-orange-600',
      emoji: '🎵',
    },
    {
      id: 'aarti',
      name: 'Aarti & Stuti',
      nameHindi: 'आरती एवं स्तुति',
      description: 'Sacred lamp offering songs & prayers',
      descriptionHindi: 'नित्य आरती, वंदना एवं स्तुति',
      icon: Flame,
      gradient: 'from-orange-500 to-red-600',
      emoji: '🔥',
    },
    {
      id: 'chalisa',
      name: 'Chalisa & Path',
      nameHindi: 'चालीसा एवं पाठ',
      description: '40-verse hymns and holy recitations',
      descriptionHindi: '40 चौपाइयों वाले पावन चालीसा संग्रह',
      icon: Scroll,
      gradient: 'from-amber-600 to-amber-800',
      emoji: '📜',
    },
    {
      id: 'katha',
      name: 'Katha & Leela',
      nameHindi: 'कथा एवं प्रसंग',
      description: 'Spiritual stories, episodes & pravachans',
      descriptionHindi: 'पौराणिक कथाएं, लीला प्रसंग एवं प्रवचन',
      icon: BookOpen,
      gradient: 'from-purple-600 to-indigo-800',
      emoji: '📖',
    },
    {
      id: 'custom',
      name: 'Custom / Other',
      nameHindi: 'अन्य दिव्य रचना',
      description: 'Stotram, Kavach, Ashtakam, Doha or custom type',
      descriptionHindi: 'स्तोत्र, अष्टकम, कवच, दोहा या मनचाहा वर्ग',
      icon: Sparkles,
      gradient: 'from-rose-500 to-pink-700',
      emoji: '✨',
      isCustom: true,
    },
  ];

  const handleSelect = (cat: ContentCategory) => {
    setSelectedId(cat.id);
    setCustomError('');
    if (!cat.isCustom) {
      onCategorySelect(cat);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameInput.trim()) {
      setCustomError(isHi ? 'कृपया श्रेणी का नाम दर्ज करें' : 'Please enter a category name');
      return;
    }

    const customCategory: ContentCategory = {
      id: 'custom_' + Date.now(),
      name: customNameInput.trim(),
      nameHindi: customNameInput.trim(),
      description: 'Custom user submission',
      descriptionHindi: 'उपयोगकर्ता द्वारा जोड़ी गई रचना',
      icon: Sparkles,
      gradient: 'from-rose-500 to-pink-700',
      emoji: '✨',
      isCustom: true,
    };

    onCategorySelect(customCategory, customNameInput.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      {/* Header Prompt */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/40 text-[#6A2C2A] dark:text-[#E8B15C] text-xs font-bold mb-3 shadow-sm">
          <span>✨ Step 1 of 4</span>
        </div>
        <h2 className="font-sans font-extrabold text-xl sm:text-2xl md:text-3xl text-[#32251E] dark:text-[#FFFDF8] leading-normal break-words px-2">
          {isHi ? 'आप क्या अपलोड करना चाहते हैं?' : 'What would you like to upload?'}
        </h2>
        <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
          {isHi 
            ? 'अपनी पसंद की भक्ति श्रेणी चुनें या मनचाही रचना जोड़ें' 
            : 'Select a devotional category below or specify a custom entry'}
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = selectedId === cat.id;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleSelect(cat)}
              className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 select-none overflow-hidden ${
                isSelected
                  ? 'bg-[#FAF2E8] dark:bg-[#2A1F14] border-[#D4A44A] dark:border-[#E8B15C] shadow-md ring-2 ring-[#D4A44A]/30'
                  : 'bg-white dark:bg-[#1E1710] border-[#EFE4D7] dark:border-zinc-800 hover:border-[#D4A44A]/60 hover:bg-[#FCF8F2] dark:hover:bg-[#251A10] shadow-sm'
              }`}
            >
              {/* Corner Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 text-[#D4A44A]">
                  <CheckCircle2 className="w-5 h-5 fill-[#D4A44A] text-white dark:text-zinc-950" />
                </div>
              )}

              <div className="flex items-start gap-3.5">
                {/* Gradient Icon Circle */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-base leading-none">{cat.emoji}</span>
                    <h3 className="font-sans font-bold text-base sm:text-lg text-[#32251E] dark:text-[#FFFDF8] leading-snug break-words">
                      {isHi ? cat.nameHindi : cat.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#7A6B60] dark:text-[#D4C5B9] leading-relaxed break-words mt-0.5">
                    {isHi ? cat.descriptionHindi : cat.description}
                  </p>
                </div>
              </div>

              {/* Bottom Glow Bar on hover */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.gradient} transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            </motion.div>
          );
        })}
      </div>

      {/* Custom Name Input Box if 'custom' category selected */}
      {selectedId === 'custom' && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCustomSubmit}
          className="bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800 p-6 rounded-2xl shadow-sm mb-6 max-w-xl mx-auto space-y-4"
        >
          <div className="flex items-center gap-2 text-[#6A2C2A] dark:text-[#E8B15C] font-semibold text-sm">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isHi ? 'मनचाही श्रेणी का नाम दर्ज करें' : 'Enter Custom Category Name'}</span>
          </div>
          
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={isHi ? "उदाहरण: स्तोत्र, अष्टकम्, कवच, दोहा..." : "e.g. Stotram, Ashtakam, Kavach, Doha..."}
              value={customNameInput}
              onChange={(e) => {
                setCustomNameInput(e.target.value);
                setCustomError('');
              }}
              className="rounded-xl border-[#EFE4D7] dark:border-zinc-800 bg-[#FCF8F2] dark:bg-[#2A1F14] text-sm h-11 text-[#32251E] dark:text-[#FFFDF8]"
              autoFocus
            />
            {customError && (
              <p className="text-xs text-red-500 font-medium">{customError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold h-11 shadow-md hover:opacity-95"
          >
            <span>{isHi ? 'आगे बढ़ें' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.form>
      )}
    </div>
  );
}

export default CategorySelector;
