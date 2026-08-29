import React from 'react';
import { Info } from 'lucide-react';
import type { NormalizedPlanet } from '@/lib/astrology/types';

interface NorthIndianKundliChartProps {
  planets: Record<string, NormalizedPlanet>;
  lagnaSign?: string;
  isUnknownTime?: boolean;
  className?: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su (सूर्य)',
  Moon: 'Mo (चन्द्र)',
  Mars: 'Ma (मंगल)',
  Mercury: 'Me (बुध)',
  Jupiter: 'Ju (गुरु)',
  Venus: 'Ve (शुक्र)',
  Saturn: 'Sa (शनि)',
  Rahu: 'Ra (राहु)',
  Ketu: 'Ke (केतु)',
};

/**
 * Authentic North Indian Diamond Vedic Kundli Chart SVG Component
 * Houses are fixed in the North Indian layout:
 * - House 1: Top Center Diamond
 * - House 2: Top Left Triangle
 * - House 3: Far Left Triangle
 * - House 4: Left Center Diamond
 * - House 5: Bottom Left Triangle
 * - House 6: Bottom Left Inner Triangle
 * - House 7: Bottom Center Diamond
 * - House 8: Bottom Right Inner Triangle
 * - House 9: Bottom Right Triangle
 * - House 10: Right Center Diamond
 * - House 11: Far Right Triangle
 * - House 12: Top Right Triangle
 */
export const NorthIndianKundliChart: React.FC<NorthIndianKundliChartProps> = ({
  planets = {},
  lagnaSign = 'Aries',
  isUnknownTime = false,
  className = '',
}) => {
  if (isUnknownTime) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-center">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-3 shadow-inner">
          <Info className="h-6 w-6" />
        </div>
        <h4 className="font-serif font-bold text-base text-[#651317]">
          लग्न चक्र उपलब्ध नहीं (Lagna Chart Omitted)
        </h4>
        <p className="text-xs text-stone-600 max-w-sm mt-1 leading-relaxed">
          सटीक जन्म समय ज्ञात न होने के कारण भाव-विशिष्ट लग्न चक्र को नहीं बनाया गया है। नीचे ग्रहों की चंद्र राशि स्थिति देखें।
        </p>
      </div>
    );
  }

  // Group planets by house (1 to 12)
  const housePlanets: Record<number, string[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
  };

  for (const [pName, pData] of Object.entries(planets)) {
    if (pData?.house && pData.house >= 1 && pData.house <= 12) {
      const label = PLANET_SYMBOLS[pName] || pName;
      const retro = pData.isRetrograde ? '(R)' : '';
      housePlanets[pData.house].push(`${label.split(' ')[0]}${retro}`);
    }
  }

  return (
    <div className={`relative w-full max-w-[420px] mx-auto select-none ${className}`}>
      {/* Outer Glow & Card Container */}
      <div className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-4 sm:p-6 rounded-2xl border-2 border-amber-300/80 shadow-md">
        <div className="text-center mb-3">
          <span className="text-[11px] font-serif font-semibold text-amber-900 uppercase tracking-widest bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-200">
            लग्न कुण्डली (Ascendant Chart)
          </span>
        </div>

        {/* SVG North Indian Diamond Chart */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto drop-shadow-sm font-sans"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          {/* Background fill */}
          <rect x="2" y="2" width="396" height="396" fill="#FFFDF8" stroke="#651317" strokeWidth="3" rx="8" />

          {/* Main Diamond Frame (connecting midpoints) */}
          <polygon points="200,2 398,200 200,398 2,200" fill="#FFF9ED" stroke="#651317" strokeWidth="2" />

          {/* Diagonals */}
          <line x1="2" y1="2" x2="398" y2="398" stroke="#651317" strokeWidth="2" />
          <line x1="398" y1="2" x2="2" y2="398" stroke="#651317" strokeWidth="2" />

          {/* Inner Corner Diamonds & Lines */}
          <line x1="200" y1="2" x2="2" y2="200" stroke="#651317" strokeWidth="2" />
          <line x1="200" y1="2" x2="398" y2="200" stroke="#651317" strokeWidth="2" />
          <line x1="2" y1="200" x2="200" y2="398" stroke="#651317" strokeWidth="2" />
          <line x1="398" y1="200" x2="200" y2="398" stroke="#651317" strokeWidth="2" />

          {/* House 1 (Top Center Diamond) */}
          <text x="200" y="70" textAnchor="middle" fill="#651317" fontSize="13" fontWeight="bold" fontFamily="serif">1 (लग्न)</text>
          <text x="200" y="105" textAnchor="middle" fill="#B45309" fontSize="11" fontWeight="600">
            {housePlanets[1].join(' ')}
          </text>

          {/* House 2 (Top Left Triangle) */}
          <text x="95" y="45" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">2</text>
          <text x="95" y="75" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[2].join(' ')}
          </text>

          {/* House 3 (Far Left Upper Triangle) */}
          <text x="45" y="95" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">3</text>
          <text x="45" y="125" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[3].join(' ')}
          </text>

          {/* House 4 (Left Center Diamond) */}
          <text x="100" y="200" textAnchor="middle" fill="#651317" fontSize="13" fontWeight="bold" fontFamily="serif">4</text>
          <text x="100" y="235" textAnchor="middle" fill="#B45309" fontSize="11" fontWeight="600">
            {housePlanets[4].join(' ')}
          </text>

          {/* House 5 (Far Left Lower Triangle) */}
          <text x="45" y="305" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">5</text>
          <text x="45" y="335" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[5].join(' ')}
          </text>

          {/* House 6 (Bottom Left Triangle) */}
          <text x="95" y="355" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">6</text>
          <text x="95" y="380" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[6].join(' ')}
          </text>

          {/* House 7 (Bottom Center Diamond) */}
          <text x="200" y="330" textAnchor="middle" fill="#651317" fontSize="13" fontWeight="bold" fontFamily="serif">7</text>
          <text x="200" y="300" textAnchor="middle" fill="#B45309" fontSize="11" fontWeight="600">
            {housePlanets[7].join(' ')}
          </text>

          {/* House 8 (Bottom Right Triangle) */}
          <text x="305" y="355" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">8</text>
          <text x="305" y="380" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[8].join(' ')}
          </text>

          {/* House 9 (Far Right Lower Triangle) */}
          <text x="355" y="305" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">9</text>
          <text x="355" y="335" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[9].join(' ')}
          </text>

          {/* House 10 (Right Center Diamond) */}
          <text x="300" y="200" textAnchor="middle" fill="#651317" fontSize="13" fontWeight="bold" fontFamily="serif">10</text>
          <text x="300" y="235" textAnchor="middle" fill="#B45309" fontSize="11" fontWeight="600">
            {housePlanets[10].join(' ')}
          </text>

          {/* House 11 (Far Right Upper Triangle) */}
          <text x="355" y="95" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">11</text>
          <text x="355" y="125" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[11].join(' ')}
          </text>

          {/* House 12 (Top Right Triangle) */}
          <text x="305" y="45" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="bold">12</text>
          <text x="305" y="75" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="600">
            {housePlanets[12].join(' ')}
          </text>
        </svg>

        <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 border-t border-amber-200/60 pt-2 px-1">
          <span>लग्नेश: {lagnaSign}</span>
          <span className="text-amber-800 font-medium">लाहिरी अयनांश (Lahiri)</span>
        </div>
      </div>
    </div>
  );
};
