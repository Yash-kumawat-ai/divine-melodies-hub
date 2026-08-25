import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import bhajanSangrahBanner from '@/pages/images/bhajan_sangrah_high_quality(1).webp';
import devWallpaperBanner from '@/pages/images/dev_wallpaper_high_quality.webp';
import liveWallpaperBanner from '@/pages/images/live_wallpaper_high_quality.webp';
import posterBanner from '@/pages/images/poster_high_quality.webp';
import darshanBanner from '@/pages/images/darshan_high_quality.webp';
import panchangBanner from '@/pages/images/panchang_high_quality(1).webp';
import naamJapBanner from '@/pages/images/naam_jap_high_quality.webp';
import bhaktiSamudayBanner from '@/pages/images/bhakti_samuday_high_quality.webp';

const HERO_MOBILE = '/hero-lcp-mobile.webp';
const HERO_DESKTOP = '/hero-lcp-desktop.webp';

// Banners Data Array
const BANNERS = [
  { 
    id: 0, 
    title: "श्रीराम के चरणों में आपका स्वागत है", 
    image: HERO_MOBILE, 
    href: "/all-bhajans",
    isHeroCard: true 
  },
  { id: 1, title: "Bhajan Sangrah", image: bhajanSangrahBanner, href: "/all-bhajans" },
  { id: 2, title: "Divine Wallpapers", image: devWallpaperBanner, href: "/wallpaper" },
  { id: 3, title: "Live Wallpapers", image: liveWallpaperBanner, href: "/wallpaper" },
  { id: 4, title: "Poster Maker", image: posterBanner, href: "/poster-maker" },
  { id: 5, title: "God Darshan", image: darshanBanner, href: "/wallpaper" },
  { id: 6, title: "Panchang", image: panchangBanner, href: "/panchang" },
  { id: 7, title: "Naam Jap", image: naamJapBanner, href: "/meditation/mantra-japa" },
  { id: 8, title: "Bhakti Samuday", image: bhaktiSamudayBanner, href: "/community" },
];

export function PromotionalCarousel() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartX = useRef(0);
  const dragDistance = useRef(0);
  const isPointerDown = useRef(false);
  const numBanners = BANNERS.length;

  // Auto-slide interval (3.5 seconds fast automatic scrolling)
  useEffect(() => {
    if (isHovering || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % numBanners);
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovering, isDragging, numBanners]);

  const handleStart = (clientX: number) => {
    isPointerDown.current = true;
    dragStartX.current = clientX;
    dragDistance.current = 0;
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isPointerDown.current) return;
    
    const diff = Math.abs(clientX - dragStartX.current);
    dragDistance.current = diff;
    
    if (!isDragging && diff > 5) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      setDragOffset(clientX - dragStartX.current);
    }
  };

  const handleEnd = () => {
    isPointerDown.current = false;
    if (!isDragging) return;
    
    setIsDragging(false);
    const threshold = 80; // Swipe drag threshold to trigger slide change
    
    if (dragOffset > threshold) {
      // Dragged right -> Go to previous slide
      setCurrentIndex((prev) => (prev - 1 + numBanners) % numBanners);
    } else if (dragOffset < -threshold) {
      // Dragged left -> Go to next slide
      setCurrentIndex((prev) => (prev + 1) % numBanners);
    }
    
    setDragOffset(0);
  };

  const handleBannerClick = (href: string, e: React.MouseEvent) => {
    // Prevent navigating if user was performing a swipe/drag gesture
    if (isDragging || Math.abs(dragOffset) > 5 || dragDistance.current > 10) {
      e.preventDefault();
      e.stopPropagation();
      dragDistance.current = 0;
      return;
    }
    navigate(href);
  };

  return (
    <div 
      className="w-full select-none relative overflow-hidden pt-1 pb-3 md:pt-3 md:pb-5 bg-transparent mb-2 md:mb-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        handleEnd();
      }}
    >
      {currentIndex < numBanners - 1 && (
        <link rel="prefetch" href={BANNERS[(currentIndex + 1) % numBanners].image} />
      )}

      {/* Styled slide container heights tuned to match hero image height */}
      <style dangerouslySetInnerHTML={{__html: `
        .carousel-track-container {
          --slide-width: 340px;
          --slide-gap: 14px;
          height: 195px; /* height corresponding to hero card */
        }
        @media (min-width: 640px) {
          .carousel-track-container {
            --slide-width: 440px;
            --slide-gap: 18px;
            height: 245px;
          }
        }
        @media (min-width: 768px) {
          .carousel-track-container {
            --slide-width: 580px;
            --slide-gap: 22px;
            height: 315px;
          }
        }
        @media (min-width: 1024px) {
          .carousel-track-container {
            --slide-width: 660px;
            --slide-gap: 26px;
            height: 355px;
          }
        }
      `}} />

      {/* Slide Container */}
      <div 
        className="carousel-track-container w-full overflow-hidden relative cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {BANNERS.map((banner, index) => {
          // Calculate offset with wrap-around
          let offset = index - currentIndex;
          const half = Math.floor(numBanners / 2);
          if (offset > half) {
            offset -= numBanners;
          } else if (offset < -half) {
            offset += numBanners;
          }

          const isActive = index === currentIndex;
          const isVisible = true;

          return (
            <div 
              key={banner.id}
              onClick={(e) => handleBannerClick(banner.href, e)}
              className={cn(
                "absolute top-0 left-1/2 rounded-[24px] overflow-hidden bg-stone-900/30 border border-black/5 dark:border-white/10 w-[var(--slide-width)] h-full transition-all duration-700 shadow-sm",
                isActive 
                  ? "scale-100 opacity-100 z-10 border-amber-500/30" 
                  : "scale-95 opacity-85 z-0"
              )}
              style={{
                transform: `translate3d(calc(-50% + ${offset} * (var(--slide-width) + var(--slide-gap)) + ${dragOffset}px), 0, 0)`,
                visibility: isVisible ? 'visible' : 'hidden',
                pointerEvents: isVisible ? 'auto' : 'none',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {banner.isHeroCard ? (
                <div 
                  className="relative w-full h-full rounded-[24px] overflow-hidden bg-[#161008] border border-[#F3E2C8]/10 select-none cursor-pointer"
                  style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.10)' }}
                >
                  <img
                    src={HERO_MOBILE}
                    srcSet={`${HERO_MOBILE} 800w, ${HERO_DESKTOP} 1400w`}
                    sizes="(max-width: 767px) 90vw, 660px"
                    alt="Lord Ram Darbar"
                    width={800}
                    height={450}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-[73%_center] z-0 pointer-events-none select-none brightness-[1.08] contrast-[1.03] saturate-[1.06]"
                  />
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0) 100%),
                        linear-gradient(90deg, rgba(22,16,8,0.82) 0%, rgba(22,16,8,0.60) 22%, rgba(22,16,8,0.28) 45%, rgba(22,16,8,0.08) 65%, transparent 82%)
                      `
                    }}
                  />
                  <div 
                    className="absolute left-[16px] top-1/2 -translate-y-1/2 z-20 max-w-[52%] flex flex-col justify-center text-left bg-gradient-to-br from-black/55 to-black/35 border border-[#F3E2C8]/15 rounded-[18px] p-3 md:p-4"
                    style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)' }}
                  >
                    <h2 
                      className="font-serif font-black text-amber-50 leading-[1.25] select-text text-[15px] sm:text-[18px] md:text-[22px]"
                    >
                      {isHi ? "श्रीराम के चरणों में" : "At the Feet"}
                    </h2>
                    <div className="w-10 h-[1.5px] bg-gradient-to-r from-amber-400 to-transparent my-1" />
                    <p 
                      className="font-sans font-bold text-amber-300 tracking-wide select-text uppercase text-[10px] sm:text-[11px] md:text-[13px]"
                    >
                      {isHi ? "आपका स्वागत है" : "of Shri Rama"}
                    </p>
                  </div>
                </div>
              ) : (
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  width={660}
                  height={355}
                  loading={isActive ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-700 hover:scale-[1.01]"
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Simple Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-4 md:mt-6">
        {BANNERS.map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                isActive 
                  ? "bg-amber-500 w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PromotionalCarousel;
