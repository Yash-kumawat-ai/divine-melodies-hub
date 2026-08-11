import { memo, forwardRef, useEffect, useState } from 'react';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { getDailyQuote } from '@/services/quote.service';

export const DivineThoughtCard = memo(
  forwardRef<HTMLDivElement, {}>(function DivineThoughtCard(_props, ref) {
    const [quote, setQuote] = useState<ReturnType<typeof getDailyQuote> | null>(null);
    const { quoteCardGradient, border, primaryText, secondaryText, accent } = useDrawerTheme();

    useEffect(() => {
      setQuote(getDailyQuote());
    }, []);

    if (!quote) return null;

    const isHindi = quote.language === 'hi';

    return (
      <div
        ref={ref}
        className="mx-4 overflow-hidden rounded-2xl transition-colors duration-300"
        style={{
          background: quoteCardGradient,
          border: `1px solid ${border}`,
          boxShadow: '0 4px 20px rgba(198,122,45,0.10)',
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            {/* Lotus */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21C12 21 3 15 3 9C3 6.8 4.7 5 7 5C8.9 5 10.5 6.3 11.5 7.5C10.5 8 9 9.5 9 11C9 12.7 10.3 14 12 14C13.7 14 15 12.7 15 11C15 9.5 13.5 8 12.5 7.5C13.5 6.3 15.1 5 17 5C19.3 5 21 6.8 21 9C21 15 12 21 12 21Z"
                fill={accent} opacity="0.8"
              />
              <path
                d="M12 14C12 14 8 12 8 9C8 7.3 9.3 6 11 6C11.7 6 12.3 6.3 12.7 6.7C13.1 6.3 13.7 6 14.5 6C16.2 6 17.5 7.3 17.5 9C17.5 12 12 14 12 14Z"
                fill="#E89A4A" opacity="0.6"
              />
            </svg>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: accent }}
            >
              Today's Divine Thought
            </span>
          </div>

          {/* Quote */}
          <blockquote
            className="text-sm leading-relaxed transition-colors duration-300"
            style={{
              color: primaryText,
              fontFamily: isHindi
                ? '"Noto Sans Devanagari", "Tiro Devanagari Hindi", serif'
                : 'Inter, sans-serif',
              fontStyle: isHindi ? 'normal' : 'italic',
              lineHeight: isHindi ? '1.9' : '1.65',
              fontWeight: isHindi ? 500 : 400,
            }}
          >
            "{quote.text}"
          </blockquote>

          {quote.source && (
            <p className="mt-2 text-[10px] font-medium transition-colors duration-300" style={{ color: secondaryText }}>
              — {quote.source}
            </p>
          )}

          <div
            className="mt-3 h-px w-full"
            style={{ background: `linear-gradient(90deg, ${accent}66 0%, transparent 100%)` }}
          />
          <p className="mt-2 text-[10px] transition-colors duration-300" style={{ color: secondaryText }}>
            🕉 Refreshes daily at midnight
          </p>
        </div>
      </div>
    );
  })
);
