import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CategorySelector, { ContentCategory } from '@/components/Upload/CategorySelector';
import DeitySelector from '@/components/Upload/DeitySelector';
import AddDeity from '@/components/Upload/AddDeity';
import LyricsUpload from '@/components/Upload/FileUpload';
import BhajanForm from '@/components/Upload/BhajanForm';
import LoginForm from '@/components/Auth/LoginForm';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Deity } from '@/hooks/useDeities';
import { SEO } from '@/components/SEO';

import devotionalBg from '@/pages/images/devotional_background (1).webp';

type Step = 'category' | 'deity' | 'addDeity' | 'lyrics' | 'details';

interface SelectedDeity {
  id?: number;
  name: string;
  emoji: string;
  description?: string;
  imageUrl?: string;
}

export default function UploadBhajan() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [selectedDeity, setSelectedDeity] = useState<SelectedDeity | null>(null);
  const [lyricsUrl, setLyricsUrl] = useState('');
  const [lyricsType, setLyricsType] = useState<'image' | 'text'>('image');
  const [lyricsContent, setLyricsContent] = useState('');
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8] dark:bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#6A2C2A] dark:text-[#E8B15C] mx-auto mb-3" />
          <p className="text-[#7A6B60] dark:text-[#D4C5B9] font-medium text-sm">
            {isHi ? "लोड हो रहा है..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] dark:bg-background py-12 px-4">
        <SEO 
          title={isHi ? "भजन अपलोड करें" : "Upload Devotional Content"} 
          description="Share bhajans, aartis, chalisas, and kathas with the Raghavam community."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-[#1E1710]/80 border border-[#EFE4D7] dark:border-zinc-800 p-8 rounded-2xl max-w-md mx-auto mb-8 text-center shadow-sm backdrop-blur-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/50 flex items-center justify-center text-2xl mx-auto mb-3">
            🌸
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#32251E] dark:text-[#FFFDF8] mb-2">
            {isHi ? "भक्ति रचना जोड़ें" : "Share Devotional Content"}
          </h1>
          <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm">
            {isHi 
              ? "कम्युनिटी के साथ अपने पसंदीदा भजन, आरती, चालीसा या कथा साझा करने के लिए लॉग इन करें" 
              : "Log in to share your favorite bhajans, aartis, chalisas, or kathas with the community"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="container mx-auto max-w-md px-4"
        >
          <LoginForm />
        </motion.div>
      </div>
    );
  }

  const handleCategorySelect = (category: ContentCategory, customName?: string) => {
    setSelectedCategory(category);
    if (customName) {
      setCustomCategoryName(customName);
    } else {
      setCustomCategoryName(category.nameHindi);
    }
    setStep('deity');
  };

  const handleDeitySelect = (deity: Deity) => {
    setSelectedDeity({
      id: deity.id,
      name: deity.name,
      emoji: deity.emoji,
      description: deity.description,
      imageUrl: deity.imageUrl,
    });
    setStep('lyrics');
  };

  const handleAddNewDeity = () => {
    setStep('addDeity');
  };

  const handleDeityAdded = (deity: any) => {
    setSelectedDeity(deity);
    setStep('lyrics');
  };

  const handleLyricsSelect = (url: string, type: 'image' | 'text', content: string) => {
    setLyricsUrl(url);
    setLyricsType(type);
    setLyricsContent(content);
    setStep('details');
  };

  const handleUploadSuccess = () => {
    navigate('/');
  };

  const getStepNumber = () => {
    if (step === 'category') return 1;
    if (step === 'deity' || step === 'addDeity') return 2;
    if (step === 'lyrics') return 3;
    if (step === 'details') return 4;
    return 1;
  };

  const handleGoBack = () => {
    if (step === 'details') setStep('lyrics');
    else if (step === 'lyrics') setStep('deity');
    else if (step === 'addDeity') setStep('deity');
    else if (step === 'deity') setStep('category');
    else navigate(-1);
  };

  const stepLabels = [
    isHi ? 'श्रेणी' : 'Category',
    isHi ? 'भगवान' : 'Deity',
    isHi ? 'बोल व मीडिया' : 'Lyrics',
    isHi ? 'विवरण' : 'Details',
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-background pb-20 md:pb-12">
      <SEO 
        title={isHi ? "भक्ति रचना जोड़ें - राघवम्" : "Add Devotional Content - Raghavam"} 
        description="Share bhajans, aartis, chalisas, and kathas with the Raghavam community."
      />

      {/* ── LANDSCAPE HERO BANNER MATCHING image-1784960575476.png ── */}
      <div className="p-2.5 sm:p-4 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-[#E8D8C4] dark:border-zinc-800 shadow-md bg-[#FAF2E8] dark:bg-[#1E1710] p-4 sm:p-6 min-h-[140px] sm:min-h-[170px] flex flex-col justify-between">
          {/* Background Image showing bottom part in natural bright style */}
          <img
            src={devotionalBg}
            alt="Bhakti Background"
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
          {/* Subtle natural light/dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/15 to-[#FFFDF8]/80 dark:from-black/40 dark:via-black/60 dark:to-black/85" />

          {/* Top Row: Circular White Back Button & Category Pill */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <button
              type="button"
              onClick={handleGoBack}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-zinc-900/90 shadow-md border border-[#EFE4D7] dark:border-zinc-800 flex items-center justify-center text-[#5A1F1A] dark:text-[#E8B15C] hover:scale-105 active:scale-95 transition-all"
              aria-label={t('back')}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:w-5" />
            </button>

            {selectedCategory && (
              <div className="px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-zinc-900/90 border border-[#EFE4D7] dark:border-zinc-800 shadow-md text-xs font-bold text-[#5A1F1A] dark:text-[#E8B15C] flex items-center gap-1.5">
                <span>{selectedCategory.emoji}</span>
                <span>{customCategoryName || selectedCategory.nameHindi}</span>
              </div>
            )}
          </div>

          {/* Center Column: Title, Lotus Flourish line & Subtitle */}
          <div className="relative z-10 text-center py-2 sm:py-3 px-2">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4A1516] dark:text-[#FFFDF8] tracking-wide drop-shadow-sm">
              {isHi ? "भक्ति रचना जोड़ें" : "Upload Devotional Content"}
            </h1>
            
            {/* Ornate Flourish Line */}
            <div className="flex items-center justify-center gap-2 my-1 opacity-80">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
              <span className="text-[#7A2D28] dark:text-[#E8B15C] text-xs">🪷</span>
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
            </div>

            <p className="text-[#5C3026] dark:text-[#D4C5B9] text-xs sm:text-sm font-bold max-w-lg mx-auto leading-relaxed">
              {isHi 
                ? "भजन, आरती, चालीसा, कथा या अन्य भक्ति रचना समुदाय के साथ साझा करें" 
                : "Share bhajans, aartis, chalisas, kathas with the community"}
            </p>
          </div>
        </div>
      </div>

      <div className="py-2 sm:py-4 px-3 sm:px-4">
        <div className="container mx-auto max-w-5xl">

          {/* 4-Step Progress Indicator */}
          <div className="mb-8 sm:mb-10 max-w-xl mx-auto px-1 sm:px-4">
            <div className="flex items-center justify-between relative">
              {stepLabels.map((label, idx) => {
                const currentStepNum = getStepNumber();
                const stepIdx = idx + 1;
                const isCompleted = currentStepNum > stepIdx;
                const isActive = currentStepNum === stepIdx;

                return (
                  <div key={label} className="flex flex-col items-center relative z-10 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-[#5A1F1A] dark:bg-[#E8B15C] text-white dark:text-zinc-950'
                          : isActive
                          ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 ring-4 ring-[#D4A44A]/20'
                          : 'bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800 text-[#7A6B60] dark:text-[#D4C5B9]'
                      }`}
                    >
                      {isCompleted ? '✓' : stepIdx}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold mt-1 text-center truncate max-w-[70px] sm:max-w-none ${
                      isActive ? 'text-[#32251E] dark:text-[#FFFDF8]' : 'text-[#7A6B60] dark:text-[#D4C5B9]'
                    }`}>
                      {label}
                    </span>
                  </div>
                );
              })}

              {/* Connecting line */}
              <div className="absolute top-4 sm:top-5 left-8 right-8 h-0.5 bg-[#EFE4D7] dark:bg-zinc-800 -z-0" />
            </div>
          </div>

          {/* Content Steps */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 1: Category Selection */}
            {step === 'category' && (
              <CategorySelector onCategorySelect={handleCategorySelect} />
            )}

            {/* Step 2: Deity Selection */}
            {step === 'deity' && (
              <div className="space-y-6">
                <DeitySelector onDeitySelect={handleDeitySelect} onAddNewDeity={handleAddNewDeity} />
              </div>
            )}

            {/* Step 2 Sub-step: Add New Deity */}
            {step === 'addDeity' && (
              <div className="space-y-6">
                <AddDeity
                  onDeityAdded={handleDeityAdded}
                  onBack={() => setStep('deity')}
                />
              </div>
            )}

            {/* Step 3: Lyrics & Media Upload (Cloudinary support) */}
            {step === 'lyrics' && selectedDeity && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/40 text-[#6A2C2A] dark:text-[#E8B15C] text-xs font-bold">
                    <span>✨ Step 3 of 4</span>
                  </span>
                  <div className="text-5xl my-2">{selectedDeity.emoji}</div>
                  <h2 className="font-serif text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8]">
                    {selectedDeity.name}
                  </h2>
                  <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm mt-1">
                    {isHi ? "बोल (Lyrics) या रचना की फोटो अपलोड करें" : "Add lyrics text or upload handwritten/printed lyrics image"}
                  </p>
                </div>

                <LyricsUpload onLyricsSelect={handleLyricsSelect} />
              </div>
            )}

            {/* Step 4: Details & Final Submit */}
            {step === 'details' && selectedDeity && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/40 text-[#6A2C2A] dark:text-[#E8B15C] text-xs font-bold">
                    <span>✨ Step 4 of 4</span>
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8] mt-2">
                    {isHi ? "अंतिम विवरण दर्ज करें" : "Final Details"}
                  </h2>
                </div>

                <BhajanForm
                  lyrics={lyricsContent}
                  imageUrl={lyricsUrl}
                  deityId={selectedDeity.id}
                  deityName={selectedDeity.name}
                  categoryName={customCategoryName || selectedCategory?.name}
                  categoryHindi={customCategoryName || selectedCategory?.nameHindi}
                  categoryEmoji={selectedCategory?.emoji}
                  categoryId={selectedCategory?.id}
                  onSuccess={handleUploadSuccess}
                  onBack={() => setStep('lyrics')}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
