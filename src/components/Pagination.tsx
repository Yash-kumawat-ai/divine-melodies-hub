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

  return (
    <div className="mt-10 flex items-center justify-center gap-2 flex-wrap select-none">
      {/* Prev Button */}
      <button
        type="button"
        onClick={() => {
          onPageChange(Math.max(1, currentPage - 1));
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
        className="h-10 px-4 rounded-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold border border-[#E8D8C4] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#5A1F1A] dark:text-[#E8B15C] disabled:opacity-40 hover:bg-[#FAF2E8] transition-all cursor-pointer shadow-sm leading-none"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        <span>{isHi ? 'पिछला' : 'Prev'}</span>
      </button>

      {/* Numbered Page Buttons */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => {
            onPageChange(page);
            window.scrollTo({ top: 200, behavior: 'smooth' });
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-center leading-none p-0 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
            currentPage === page
              ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 scale-105 shadow-md'
              : 'bg-white dark:bg-[#1E1710] border border-[#E8D8C4] dark:border-zinc-800 text-[#5A1F1A] dark:text-[#E8B15C] hover:bg-[#FAF2E8]'
          }`}
        >
          <span className="translate-y-[0.5px]">{page}</span>
        </button>
      ))}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => {
          onPageChange(Math.min(totalPages, currentPage + 1));
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
        disabled={currentPage === totalPages}
        className="h-10 px-4 rounded-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold border border-[#E8D8C4] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#5A1F1A] dark:text-[#E8B15C] disabled:opacity-40 hover:bg-[#FAF2E8] transition-all cursor-pointer shadow-sm leading-none"
      >
        <span>{isHi ? 'अगला' : 'Next'}</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
}
