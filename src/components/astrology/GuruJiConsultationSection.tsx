import React from 'react';
import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuruJiConsultationSectionProps {
  isHi: boolean;
}

const QUICK_QUESTIONS = [
  { hi: 'मेरी कुंडली में करियर और धन योग क्या हैं?', en: 'What are the career and wealth yogas in my chart?' },
  { hi: 'वर्तमान महादशा का मेरे जीवन पर क्या प्रभाव है?', en: 'What is the impact of my current Mahadasha?' },
  { hi: 'मेरे इष्ट देव और शुभ साधना क्या हैं?', en: 'What is my Ishta Devata and best sadhana?' },
];

const GuruJiConsultationSectionInner: React.FC<GuruJiConsultationSectionProps> = ({ isHi }) => {
  const navigate = useNavigate();

  const handleAskQuestion = (question?: string) => {
    navigate('/ask-guru-ji', {
      state: question ? { initialQuery: question } : undefined,
    });
  };

  return (
    <section id="guidance" className="print:hidden">
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-surface-raised to-brand-primary/10 border border-brand-gold-border/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-brand-primary/15 border border-brand-gold-border/60 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5 text-brand-primary dark:text-brand-gold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-brand text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                  {isHi ? 'एआई ज्योतिष मार्गदर्शन' : 'AI Vedic Guidance'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-foreground leading-snug">
                {isHi ? 'अपनी कुण्डली को और गहराई से समझें — गुरु जी से पूछें' : 'Understand your Kundli in Depth — Consult Guru Ji'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {isHi
                  ? 'करियर, विवाह, सक्रिय महादशा प्रभाव, साधना एवं उपायों के बारे में अपनी जन्म कुंडली के आधार पर तुरंत उत्तर पाएं।'
                  : 'Receive personalized Vedic astrological answers on career, relationships, active Dasha impacts, and spiritual remedies.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAskQuestion()}
            className="btn-primary btn-md inline-flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto shadow-xs active:scale-95 transition-transform"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{isHi ? 'गुरु जी से पूछें →' : 'Consult Guru Ji →'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-brand-gold-border/20">
          <p className="text-[11px] font-semibold text-muted-foreground mb-2">
            {isHi ? 'त्वरित प्रश्न सुझाव:' : 'Popular Questions to Ask:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, idx) => {
              const text = isHi ? q.hi : q.en;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskQuestion(text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-background/90 hover:bg-[#FAF0E4] dark:hover:bg-amber-500/20 text-foreground/90 hover:text-brand-primary dark:hover:text-amber-300 border border-brand-gold-border/30 hover:border-brand-gold/60 transition-all text-left group"
                >
                  <Sparkles className="h-3 w-3 text-brand-gold shrink-0" />
                  <span>{text}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-brand-primary dark:group-hover:text-brand-gold transition-colors ml-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const GuruJiConsultationSection = React.memo(GuruJiConsultationSectionInner);
