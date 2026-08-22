import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface FeatureConceptCardProps {
  className?: string;
  titleEn: string;
  titleHi: string;
  sectionTagEn?: string;
  sectionTagHi?: string;
  linesEn: string[];
  linesHi: string[];
  badgeEn: string;
  badgeHi: string;
  ctaEn: string;
  ctaHi: string;
  href: string;
  accent?: string;
  imageSrc: string;
  imageAlt: string;
}

/** 
 * Elegant Promotional Feature Card — NO MANDALAS.
 * Purely designed to advertise its section (Dhyan Jap, Bhakti Samuday, etc.)
 */
export function FeatureConceptCard({
  className,
  titleEn,
  titleHi,
  sectionTagEn = "Section Showcase",
  sectionTagHi = "अनुभाग",
  linesEn,
  linesHi,
  badgeEn,
  badgeHi,
  ctaEn,
  ctaHi,
  href,
  accent = '#651317',
  imageSrc,
  imageAlt,
}: FeatureConceptCardProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const lines = isHi ? linesHi : linesEn;
  const tag = isHi ? sectionTagHi : sectionTagEn;

  return (
    <div className={cn('w-full h-full flex flex-col select-none group', className)}>
      <div className="relative flex-1 flex flex-col rounded-[22px] bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#FFFDF9] dark:from-[#1B130C] dark:via-[#221810] dark:to-[#1B130C] border border-[#EADBCC] dark:border-stone-800/90 shadow-[0_8px_20px_rgba(95,72,38,0.04)] hover:shadow-[0_12px_28px_rgba(95,72,38,0.09)] transition-all duration-300 overflow-hidden">
        {/* Sleek top accent line */}
        <div 
          className="h-1 w-full opacity-80" 
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} 
        />

        <div className="relative z-10 flex flex-col flex-1 px-4 pt-3 pb-3.5">
          {/* Header Section Tag Badge */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase border border-[#E8D8C4]/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 shadow-2xs"
              style={{ color: accent }}
            >
              <Sparkles className="w-3 h-3 shrink-0" style={{ color: accent }} />
              {tag}
            </span>

            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
              style={{
                color: accent,
                background: `${accent}12`,
              }}
            >
              {isHi ? badgeHi : badgeEn}
            </span>
          </div>

          {/* Title & Preview Image Row */}
          <div className="flex items-center gap-3.5 flex-1 min-h-[110px]">
            {/* Image Thumbnail with subtle hover zoom */}
            <div className="relative shrink-0 w-[76px] h-[76px] rounded-2xl overflow-hidden border border-[#E8D8C4] dark:border-stone-700/80 bg-[#FFF8EF] dark:bg-[#24190F] shadow-xs group-hover:scale-[1.03] transition-transform duration-300">
              <img
                src={imageSrc}
                alt={imageAlt}
                width={76}
                height={76}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Description / Feature pitch */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 py-0.5">
              <h3 
                className="font-serif text-[15px] sm:text-[16px] font-extrabold text-[#3A2412] dark:text-[#F8E9D2] leading-tight"
                style={{ color: accent }}
              >
                {isHi ? titleHi : titleEn}
              </h3>

              <div className="flex flex-col gap-0.5 mt-0.5">
                {lines.map((line, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      'text-[#5A4535] dark:text-stone-300 font-medium text-left leading-snug text-[12.5px] sm:text-[13px]',
                      isHi && 'hindi-text text-[13px] sm:text-[13.5px]'
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Call to Action Button */}
          <button
            type="button"
            onClick={() => navigate(href)}
            className="btn-royal-secondary mt-3 w-full h-10 rounded-xl !px-3.5 text-[12.5px] sm:text-sm font-bold gap-2 !bg-white dark:!bg-[#261B11] hover:!bg-[#FAF2E8] dark:hover:!bg-[#2E2015] border border-[#EAD7C3] dark:border-stone-700/80 shadow-2xs group-hover:border-[#651317]/40 dark:group-hover:border-amber-400/40 transition-all duration-200"
          >
            <span className="truncate" style={{ color: accent }}>
              {isHi ? ctaHi : ctaEn}
            </span>
            <ArrowRight className="!w-4 !h-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: accent }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeatureConceptCard;
