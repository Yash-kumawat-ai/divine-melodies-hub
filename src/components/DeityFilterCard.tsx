import React from "react";
import { cn } from "@/lib/utils";

import basuriSvg from "@/pages/images/svg/basuri.svg";
import templeSvg from "@/pages/images/svg/temple.svg";
import shivayyWhiteFlowerSvg from "@/pages/images/svg/shivayy white flower.svg";
import ramYellowFlowerSvg from "@/pages/images/svg/ram yellow flower.svg";
import radhePinkFlowerSvg from "@/pages/images/svg/radhe pink flower.svg";
import shyamBlueFlowerSvg from "@/pages/images/svg/shyam blue flower.svg";

import hanumanImg from "@/pages/images/Hanumanji_HD_WebP.webp";

export interface DeityItem {
  id: string | null;
  name: string;
  nameEn: string;
  isIcon?: boolean;
  image?: string;
  symbol?: string;
}

export const DEFAULT_DEITIES_LIST: DeityItem[] = [
  { id: null,          name: "सभी",    nameEn: "All",    isIcon: false, image: templeSvg },
  { id: "Shiva",        name: "शिव",    nameEn: "Shiva",  isIcon: false, image: shivayyWhiteFlowerSvg },
  { id: "Rama",         name: "राम",    nameEn: "Ram",    isIcon: false, image: ramYellowFlowerSvg },
  { id: "Krishna",      name: "कृष्ण",  nameEn: "Krishna",isIcon: false, image: basuriSvg },
  { id: "Hanuman",      name: "हनुमान", nameEn: "Hanuman",isIcon: false, image: hanumanImg },
  { id: "Radha",        name: "राधा",   nameEn: "Radha",  isIcon: false, image: radhePinkFlowerSvg },
  { id: "Khatu Shyam",  name: "श्याम",  nameEn: "Shyam",  isIcon: false, image: shyamBlueFlowerSvg },
];

export interface DeityFilterCardProps {
  deity: DeityItem;
  isActive: boolean;
  onClick: () => void;
  isDark?: boolean;
  isHi?: boolean;
  className?: string;
}

export const DeityFilterCard: React.FC<DeityFilterCardProps> = React.memo(({
  deity,
  isActive,
  onClick,
  isDark = false,
  isHi = true,
  className,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "w-[92px] h-[124px] flex flex-col items-center justify-between p-2 pb-3.5 rounded-2xl transition-all duration-100 ease-out active:scale-95 active:opacity-80 relative shrink-0 outline-none focus:outline-none group cursor-pointer select-none border",
        isActive
          ? "bg-[#FFFDF9] border-[#651317] shadow-[0_4px_16px_rgba(101,19,23,0.18)]"
          : isDark
          ? "bg-[#1f0f08]/90 border-[#651317]/35 hover:border-[#651317] shadow-sm"
          : "bg-[#FFFDF9] border-[#651317]/25 hover:border-[#651317] shadow-sm shadow-[#651317]/5",
        className
      )}
    >
      {/* Centering container for crop */}
      <div className="relative w-[76px] h-[76px] flex items-center justify-center shrink-0">
        {/* Centered rounded-xl card crop with #651317 hairline border */}
        <div
          className={cn(
            "relative z-10 w-[74px] h-[74px] rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-inner transition-colors border",
            isActive ? "border-[#651317]" : "border-[#651317]/30 group-hover:border-[#651317]"
          )}
        >
          {deity.isIcon || !deity.image ? (
            <img
              src={basuriSvg}
              alt="Bansuri"
              className="w-7.5 h-7.5 object-contain p-0.5"
            />
          ) : (
            <img
              src={deity.image}
              alt={deity.nameEn}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Deity name */}
      <span
        className={cn(
          "relative z-10 font-bold font-serif text-center leading-tight tracking-wide mt-2 pb-0.5",
          isHi ? "text-[16px] sm:text-[17px] font-black" : "text-[14px] sm:text-[15px]",
          isActive
            ? isDark
              ? "text-amber-300"
              : "text-[#651317]"
            : isDark
            ? "text-amber-200/80"
            : "text-[#2B1F18]"
        )}
      >
        {isHi ? deity.name : deity.nameEn}
      </span>
    </button>
  );
});

DeityFilterCard.displayName = "DeityFilterCard";

export interface DeityFilterStripProps {
  selectedDeity: string | null;
  onSelectDeity: (deityId: string | null) => void;
  deities?: DeityItem[];
  isDark?: boolean;
  isHi?: boolean;
  className?: string;
}

export const DeityFilterStrip: React.FC<DeityFilterStripProps> = React.memo(({
  selectedDeity,
  onSelectDeity,
  deities = DEFAULT_DEITIES_LIST,
  isDark = false,
  isHi = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-1.5 overflow-x-auto pb-3 pt-1.5 scrollbar-none w-full justify-start sm:justify-center px-1",
        className
      )}
    >
      {deities.map((deity) => (
        <DeityFilterCard
          key={deity.id ?? "all"}
          deity={deity}
          isActive={selectedDeity === deity.id}
          onClick={() => onSelectDeity(deity.id)}
          isDark={isDark}
          isHi={isHi}
        />
      ))}
    </div>
  );
});

DeityFilterStrip.displayName = "DeityFilterStrip";

export default DeityFilterCard;
