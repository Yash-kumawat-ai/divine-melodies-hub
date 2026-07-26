import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Import poster assets
import bhajanSangrahBanner from '@/pages/images/bhajan_sangrah_high_quality(1).webp';
import devWallpaperBanner from '@/pages/images/dev_wallpaper_high_quality.webp';
import liveWallpaperBanner from '@/pages/images/live_wallpaper_high_quality.webp';
import posterBanner from '@/pages/images/poster_high_quality.webp';
import darshanBanner from '@/pages/images/darshan_high_quality.webp';
import panchangBanner from '@/pages/images/panchang_high_quality(1).webp';
import naamJapBanner from '@/pages/images/naam_jap_high_quality.webp';
import bhaktiSamudayBanner from '@/pages/images/bhakti_samuday_high_quality.webp';

// Banners Data Array
const BANNERS = [
  { id: 1, title: "Bhajan Sangrah", image: bhajanSangrahBanner, href: "/all-bhajans" },
  { id: 2, title: "Divine Wallpapers", image: devWallpaperBanner, href: "/wallpaper" },
  { id: 3, title: "Live Wallpapers", image: liveWallpaperBanner, href: "/wallpaper" },
  { id: 4, title: "Poster Maker", image: posterBanner, href: "/poster-maker" },
  { id: 5, title: "God Darshan", image: darshanBanner, href: "/wallpaper" },
  { id: 6, title: "Panchang", image: panchangBanner, href: "/panchang" },
  { id: 7, title: "Naam Jap", image: naamJapBanner, href: "/community" },
  { id: 8, title: "Bhakti Samuday", image: bhaktiSamudayBanner, href: "/community" },
];

export function PromotionalCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartX = useRef(0);
  const dragDistance = useRef(0);
  const isPointerDown = useRef(false);
  const numBanners = BANNERS.length;

  // Auto-slide interval (8 seconds)
  useEffect(() => {
    if (isHovering || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % numBanners);
    }, 8000);

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
      className="w-full select-none relative overflow-hidden pt-4 pb-6 md:pt-6 md:pb-8 bg-transparent mb-4 md:mb-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        handleEnd();
      }}
    >
      {/* Prefetch adjacent banners */}
      <link rel="prefetch" href={BANNERS[(currentIndex + 1) % numBanners].image} />
      <link rel="prefetch" href={BANNERS[(currentIndex - 1 + numBanners) % numBanners].image} />

      {/* Styled slide container heights based on 16:9 aspect ratio */}
      <style dangerouslySetInnerHTML={{__html: `
        .carousel-track-container {
          --slide-width: 320px;
          --slide-gap: 16px;
          height: 180px; /* height corresponding to 16:9 ratio of 320px */
        }
        @media (min-width: 640px) {
          .carousel-track-container {
            --slide-width: 400px;
            --slide-gap: 20px;
            height: 225px; /* 400 * 9 / 16 */
          }
        }
        @media (min-width: 768px) {
          .carousel-track-container {
            --slide-width: 520px;
            --slide-gap: 24px;
            height: 292.5px; /* 520 * 9 / 16 */
          }
        }
        @media (min-width: 1024px) {
          .carousel-track-container {
            --slide-width: 600px;
            --slide-gap: 28px;
            height: 337.5px; /* 600 * 9 / 16 */
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
                "absolute top-0 left-1/2 rounded-[24px] overflow-hidden bg-stone-900/30 border border-black/5 dark:border-white/10 aspect-[16/9] w-[var(--slide-width)] h-full transition-all duration-700 shadow-sm",
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
              <img 
                src={banner.image} 
                alt={banner.title}
                loading={isActive ? "eager" : "lazy"}
                className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-700 hover:scale-[1.01]"
                draggable={false}
              />
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
