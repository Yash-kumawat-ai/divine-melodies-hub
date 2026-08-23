import { ZoomIn } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CoverProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export function CommunityCoverImage({ src, alt, priority, className }: CoverProps) {
  return (
    <div className={cn("relative aspect-[16/9] w-full overflow-hidden bg-stone-100 dark:bg-stone-900", className)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-[center_20%]"
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
      />
    </div>
  );
}

type EventImageProps = {
  src: string;
  alt: string;
  children?: ReactNode;
};

export function CommunityEventImage({ src, alt, children }: EventImageProps) {
  return (
    <div className="relative w-full overflow-hidden bg-[#FAF6EE] dark:bg-[#1a1410]">
      <div className="flex max-h-[min(52vh,22rem)] w-full items-center justify-center bg-[#1a1410]/90">
        <img
          src={src}
          alt={alt}
          className="max-h-[min(52vh,22rem)] w-full h-auto object-contain"
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
          }}
        />
      </div>
      {children}
    </div>
  );
}

type PostImageProps = {
  src: string;
  alt: string;
  title?: string;
  onClick?: () => void;
};

export function CommunityPostImage({ src, alt, title, onClick }: PostImageProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-[#E8D8C4]/80 bg-[#111110] shadow-2xs dark:border-stone-800"
    >
      <div className="flex max-h-[min(70vh,32rem)] w-full items-center justify-center bg-black/80">
        <img
          src={src}
          alt={alt}
          className="max-h-[min(70vh,32rem)] w-full h-auto object-contain"
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
          }}
        />
      </div>
      <div className="absolute right-2.5 top-2.5 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
        <ZoomIn className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}
