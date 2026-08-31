import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuruJiConsultationSectionProps {
  isHi: boolean;
}

const GuruJiConsultationSectionInner: React.FC<GuruJiConsultationSectionProps> = ({ isHi }) => {
  const navigate = useNavigate();

  return (
    <section id="guidance" className="scroll-mt-32 print:hidden">
      <div className="rounded-2xl bg-gradient-to-br from-brand-primary/10 via-surface-raised to-brand-gold/10 border border-brand-gold-border/50 p-5 sm:p-6 shadow-sm relative overflow-hidden">
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
            onClick={() => navigate('/ask-guru-ji')}
            className="btn-primary btn-md inline-flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto shadow-md"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{isHi ? 'गुरु जी से पूछें →' : 'Consult Guru Ji →'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export const GuruJiConsultationSection = React.memo(GuruJiConsultationSectionInner);
