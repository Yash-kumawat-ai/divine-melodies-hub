import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

import abhijitMuhuratLotus from '@/pages/images/abhijit muhrat.webp';
import mandalaSvg from '@/pages/images/mandala.svg';

interface FeatureConceptCardProps {
  className?: string;
  titleEn: string;
  titleHi: string;
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

/** Cream insight card — same family as Ram Vani, for branded feature intros. */
export function FeatureConceptCard({
  className,
  titleEn,
  titleHi,
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

  return (
    <div className={cn('w-full h-full flex flex-col select-none', className)}>
      <div className="relative flex-1 flex flex-col rounded-[20px] bg-[#FFFDF6] dark:bg-[#1E1710] border border-[#EAD7C3] dark:border-zinc-800/80 shadow-[0_6px_14px_rgba(95,72,38,0.04)] overflow-hidden">
        <img
          src={mandalaSvg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-2 top-8 w-16 h-16 object-contain opacity-[0.12] dark:opacity-[0.06] z-0 filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]"
        />
        <img
          src={mandalaSvg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-8 w-16 h-16 object-contain opacity-[0.12] dark:opacity-[0.06] z-0 rotate-90 filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]"
        />

        <div className="relative z-10 flex flex-col flex-1 px-3 pt-2 pb-3">
          <div className="flex items-center justify-center gap-2 mb-2 px-1">
            <img src={abhijitMuhuratLotus} alt="" className="w-3.5 h-3.5 object-contain opacity-80" />
            <span
              className="font-serif text-[13px] md:text-[14px] font-extrabold tracking-wide text-center dark:text-[#E6C46A]"
              style={{ color: accent }}
            >
              ✦ {isHi ? titleHi : titleEn} ✦
            </span>
            <img src={abhijitMuhuratLotus} alt="" className="w-3.5 h-3.5 object-contain opacity-80" />
          </div>

          <div className="flex items-center gap-3 flex-1 min-h-[112px]">
            <div className="relative shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden border border-[#EAD7C3]/80 dark:border-zinc-700/70 bg-[#FFF8EF] dark:bg-[#24190F]">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col items-start justify-center gap-1 py-0.5">
              {lines.map((line, idx) => (
                <p
                  key={idx}
                  className={cn(
                    'text-[#3A2412] dark:text-[#F3E2C8] font-semibold text-left leading-snug text-[13px] sm:text-[14px]',
                    isHi && 'hindi-text font-bold text-[14px] sm:text-[15px]',
                  )}
                >
                  {line}
                </p>
              ))}
              <span
                className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
                style={{
                  color: accent,
                  background: 'rgba(101,19,23,0.08)',
                }}
              >
                {isHi ? badgeHi : badgeEn}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(href)}
            className="btn-royal-secondary mt-2.5 w-full h-10 rounded-xl !px-3 text-[12px] sm:text-sm font-semibold gap-1.5 !bg-[#FFFDF8] hover:!bg-[#FFF8EF] dark:!bg-[#24190F]"
          >
            <span className="truncate">{isHi ? ctaHi : ctaEn}</span>
            <ArrowRight className="!w-3.5 !h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeatureConceptCard;
