import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  if (totalPages <= 1) return null;

  // Calculate visible page range for clean display on both desktop and mobile
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    pages.push(1);

    if (showEllipsisStart) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 mb-4 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap select-none w-full px-2">
      {/* Prev Button */}
      <button
        type="button"
        onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-9 sm:h-10 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1 text-xs sm:text-sm font-bold border border-[#E8D8C4] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#5A1F1A] dark:text-[#E8B15C] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#FAF2E8] active:scale-95 transition-all cursor-pointer shadow-sm leading-none shrink-0"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span>{isHi ? 'पिछला' : 'Prev'}</span>
      </button>

      {/* Numbered Page Buttons */}
      {getPageNumbers().map((page, idx) => {
        if (typeof page === 'string') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-7 h-9 sm:w-9 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold text-[#7B6048] dark:text-stone-400 select-none"
            >
              •••
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            onClick={() => handlePageClick(page)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-center leading-none p-0 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm shrink-0 active:scale-95 ${
              currentPage === page
                ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 scale-105 shadow-md'
                : 'bg-white dark:bg-[#1E1710] border border-[#E8D8C4] dark:border-zinc-800 text-[#5A1F1A] dark:text-[#E8B15C] hover:bg-[#FAF2E8]'
            }`}
          >
            <span>{page}</span>
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-9 sm:h-10 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1 text-xs sm:text-sm font-bold border border-[#E8D8C4] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#5A1F1A] dark:text-[#E8B15C] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#FAF2E8] active:scale-95 transition-all cursor-pointer shadow-sm leading-none shrink-0"
      >
        <span>{isHi ? 'अगला' : 'Next'}</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
}

