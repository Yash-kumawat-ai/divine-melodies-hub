import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { PetalsOverlay, AuraOverlay, FlameOverlay, ShimmerOverlay } from "./Overlays";

// ─── PHONE CONTAINER MOCKUP ───────────────────────────────────────
export const PhoneFrame = ({ imageUrl, previewMode = "lock", effect }: { imageUrl: string; previewMode?: "lock" | "home"; effect?: string }) => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [time, setTime] = useState("09:41");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    const locale = isHi ? 'hi-IN' : 'en-US';
    setDateStr(date.toLocaleDateString(locale, options));

    const interval = setInterval(() => {
      const d = new Date();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setTime(`${hrs}:${mins}`);
    }, 60000);
    return () => clearInterval(interval);
  }, [isHi]);

  return (
    <div
      className="relative w-[145px] h-[298px] md:w-[230px] md:h-[474px] select-none flex-shrink-0 rounded-[24px] md:rounded-[40px]"
      style={{ boxShadow: "0 25px 60px rgba(0, 0, 0, 0.55)" }}
    >
      {/* Wallpaper Image (Behind bezel) */}
      <div
        className="absolute rounded-[16px] md:rounded-[28px] overflow-hidden bg-black z-0"
        style={{ top: '1.4%', bottom: '1.4%', left: '2.8%', right: '2.8%' }}
      >
        <img
          src={imageUrl}
          alt="Phone wallpaper screen"
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Live Wallpaper Effects */}
        {effect === "petals" && <PetalsOverlay />}
        {effect === "aura" && <AuraOverlay />}
        {effect === "flame" && <FlameOverlay />}
        {effect === "shimmer" && <ShimmerOverlay />}

        {/* Screen Content Overlays */}
        {previewMode === "lock" ? (
          <div className="absolute inset-0 flex flex-col justify-between p-2 md:p-4 pb-3 md:pb-6 text-white font-sans z-10">
            {/* Date & Time */}
            <div className="flex flex-col items-center mt-3 md:mt-7 space-y-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <span className="text-[5px] md:text-[8px] font-bold tracking-wide uppercase">{dateStr || "Tuesday, 21 May"}</span>
              <span className="text-lg md:text-3xl font-extrabold font-sans tracking-tight leading-none">{time}</span>
            </div>

            {/* Bottom Widgets */}
            <div className="flex flex-col items-center gap-2 md:gap-4 mt-auto">
              <div className="flex justify-between w-full px-1 md:px-2">
                {/* Flashlight */}
                <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg border border-white/5 active:scale-90 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 md:w-4 md:h-4">
                    <path d="M18 6h-2M15 2h-6a2 2 0 00-2 2v2h10V4a2 2 0 00-2-2zM6 10h12v9a3 3 0 01-3 3H9a3 3 0 01-3-3v-9zM12 13v3" />
                  </svg>
                </div>
                {/* Camera */}
                <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg border border-white/5 active:scale-90 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 md:w-4 md:h-4">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-10 md:w-16 h-[1.5px] md:h-[3.5px] bg-white/80 rounded-full drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-end p-2 md:p-3 pb-3 md:pb-6 text-white z-10">
            {/* App Grid */}
            <div className="grid grid-cols-4 gap-x-1.5 gap-y-2 px-1 mt-4 md:mt-8">
              {[
                { label: "दर्शन", icon: "🕉" },
                { label: "पूजा", icon: "🔱" },
                { label: "आरती", icon: "🔔" },
                { label: "मंत्र", icon: "📿" },
                { label: "कथा", icon: "📖" },
                { label: "संगीत", icon: "🎵" },
                { label: "गैलरी", icon: "🖼" },
                { label: "सेटिंग्स", icon: "⚙" }
              ].map((app, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div className="w-4 h-4 md:w-7 md:h-7 rounded-[3px] md:rounded-[7px] bg-white/20 backdrop-blur-xs border border-white/10 flex items-center justify-center text-[8px] md:text-sm shadow-sm hover:bg-white/35 transition-colors">
                    {app.icon}
                  </div>
                  <span className="text-[4px] md:text-[7px] font-sans font-medium text-white/95 truncate max-w-[18px] md:max-w-[32px] tracking-tight">
                    {app.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Google Search Pill */}
            <div className="w-[90%] py-1 md:py-1.5 px-2 md:px-3 rounded-full bg-black/45 backdrop-blur-lg border border-white/10 flex items-center gap-1 shadow-lg drop-shadow-md mx-auto mt-auto mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-1.5 md:w-3 h-1.5 md:h-3 text-white/70">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-[5px] md:text-[8px] font-sans font-bold text-white/70 tracking-wide">
                {isHi ? "खोजें..." : "Search..."}
              </span>
            </div>

            {/* Bottom App Dock */}
            <div className="w-[90%] mx-auto bg-white/15 backdrop-blur-md rounded-md md:rounded-xl p-0.5 md:p-1 flex justify-around border border-white/10 mb-1">
              {["🕉", "🔱", "🔔", "📿"].map((icon, idx) => (
                <div key={idx} className="w-3.5 h-3.5 md:w-6 md:h-6 rounded-[3px] md:rounded-[6px] bg-white/25 flex items-center justify-center text-[7px] md:text-xs shadow-xs">
                  {icon}
                </div>
              ))}
            </div>

            {/* Home indicator bar */}
            <div className="w-10 md:w-16 h-[1.5px] md:h-[3.5px] bg-white/80 rounded-full mx-auto drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Phone Bezel SVG Frame Overlay */}
      <svg
        viewBox="0 0 361.74 745.52"
        className="absolute inset-0 w-full h-full pointer-events-none z-20 drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        style={{
          shapeRendering: "geometricPrecision",
          textRendering: "geometricPrecision",
          imageRendering: "optimizeQuality",
          fillRule: "evenodd",
          clipRule: "evenodd",
        }}
      >
        <defs>
          <style type="text/css">
            {`
              .fil2 {fill:black}
              .fil0 {fill:#070707}
              .fil5 {fill:#122735}
              .fil1 {fill:#151515}
              .fil4 {fill:#38383A}
              .fil3 {fill:#B1B1B1}
            `}
          </style>
        </defs>
        <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" />
          <path className="fil0" d="M354.84 694.31c0.04,4.56 -1.36,10.48 -2.64,14.25 -1.02,3 -2.39,5.89 -4.09,8.57l-7.33 9.6c-0.65,0.66 -1.14,0.69 -1.75,1.33l-1.07 1.05c-0.48,0.36 -0.19,0.2 -0.61,0.54l-6.28 4.27c-0.92,0.68 -4.53,2.44 -5.65,2.81 -3.1,1.03 -6.53,2.38 -9.89,2.77 -1.24,0.14 -2.65,0.46 -3.75,0.51 -1.36,0.06 -2.59,0.05 -4,0.05l-245.13 0c-5.35,0 -11.12,0.42 -16.04,-0.74 -2.43,-0.57 -4.51,-0.9 -6.69,-1.72 -3.48,-1.31 -6.15,-2.73 -9.28,-4.39 -1.22,-0.65 -3.13,-2.1 -3.95,-2.75 -0.03,-0.03 -0.08,-0.06 -0.11,-0.09 -0.03,-0.02 -0.07,-0.06 -0.1,-0.09l-1.37 -1.13c-0.03,-0.03 -0.07,-0.07 -0.09,-0.1 -0.03,-0.03 -0.07,-0.07 -0.1,-0.09l-1.01 -0.71c-0.32,-0.29 -0.64,-0.77 -0.98,-1.12 -1.02,-1.05 -2.35,-1.96 -3.16,-3.19l-3.64 -4.82c-4.79,-7.5 -7.89,-15.41 -7.88,-25.76l0 -608.58c0,-11.21 -0.18,-22.57 0,-33.76 0.12,-7.31 1.91,-13.62 5.08,-19.99l6.82 -10.09c0.29,-0.32 0.79,-0.66 1.13,-0.99 0.96,-0.94 2.16,-2.49 3.19,-3.14l1.81 -1.46c0.03,-0.03 0.07,-0.07 0.1,-0.09l0.42 -0.35c0.03,-0.02 0.08,-0.06 0.11,-0.08l0.44 -0.32c0.03,-0.02 0.08,-0.06 0.11,-0.08l2.37 -1.67c0.5,-0.42 -0.01,-0.09 0.68,-0.46l2.72 -1.54c5.33,-2.57 8.3,-3.47 14.18,-4.85 3.85,-0.9 11.68,-0.52 16.21,-0.52l236.67 0c8.03,0 15.34,-0.38 22.75,2.45 1.07,0.41 1.97,0.75 3.05,1.18 2.17,0.86 6.77,3.29 8.44,4.62 0.03,0.02 0.07,0.06 0.1,0.09l3.79 2.94c0.91,0.81 0.44,0.58 1.76,1.5 0.4,0.28 0.7,0.65 1.08,1.03l2.94 3.42c0.34,0.36 0.14,0.14 0.44,0.52l3.63 5.41c0.23,0.34 0.07,0.07 0.24,0.32l1.5 2.73c3.12,6.57 4.81,12.85 4.85,20.49 0.19,33.83 0,67.67 0,101.51l0 473.25c0,22.45 -0.2,45.11 -0.01,67.47zm-337.37 -677.78c8.87,-8.65 18.54,-14.77 35.7,-15.98 5.75,-0.4 19.23,-0.34 25.62,-0.34l206.87 0.1c7.99,0 17.34,-0.3 24.82,0.85 7.23,1.11 13.83,3.12 20.06,5.89 12.58,5.6 19.71,14.51 24.41,27.11 1.26,3.37 2.01,6.55 2.74,10.12 0.54,2.68 0.93,5.83 1.15,8.6l-0.12 2.98c-0.01,-9.39 -3.51,-19.66 -8.28,-27.39 -3.07,-4.97 -9.12,-11.23 -14.14,-14.5 -0.68,-0.44 -1.23,-0.88 -1.92,-1.33l-6.23 -3.41c-7.83,-4.09 -22.02,-7.38 -31.16,-7.39l-243.4 -0.38c-7.36,-0.01 -14.78,2.34 -20.65,5.03 -8.91,4.09 -13.02,8.68 -15.49,10.07zm-16.54 75.98c-1.57,0.67 -0.69,3.77 -0.66,6.67l-0 15.78c-0.28,7 -0.95,6.66 2.68,6.68l-0 34.28c-3.46,0.03 -2.87,-0.44 -2.85,6.13 0.01,2.27 0.17,4.31 0.17,6.73 0,12.41 0.16,25.92 -0.18,38.25 -0.05,1.94 -0.23,1.44 0.65,2.57l2.21 0 -0 13.6c-1.46,-0 -2.23,-0.51 -2.74,0.55 -0.45,0.94 0.05,9.16 0.05,10.57l0 29.22c0,2.56 -0.16,4.64 -0.17,7.11 -0.04,6.62 -0.59,6.11 2.85,6.12 -0.15,139.17 -0,278.37 0,417.54 0,15.5 5.36,26.01 14.03,35.66 0.4,0.45 0.81,0.83 1.25,1.25 5.2,5.04 12.34,9.3 19.45,11.7 5.96,2.01 11.43,2.52 18.44,2.52l62.48 -0.05c13.87,0 27.87,-0.19 41.72,0 6.98,0.09 13.97,0.05 20.96,0.05 6.84,0 13.96,0.19 20.76,-0.03 6.85,-0.22 14.06,-0.02 20.96,-0.02l83.63 0.05c12.46,0 22.34,-2.28 32.31,-9.41 2.32,-1.66 6.61,-5.23 8.22,-7.35 0.43,-0.56 0.84,-0.92 1.25,-1.45 6.86,-8.85 11.68,-18.52 11.67,-32.54l0 -291.98c0,-55.65 0.16,-111.32 -0,-166.96 2.2,0 1.59,-1.49 1.59,-3.54 0,-1.73 0.02,-3.46 0.01,-5.19 -0.01,-3.48 -0.17,-6.77 -0.17,-10.38l0 -41.9c0,-3.58 0.16,-6.96 0.17,-10.38 0.01,-1.73 -0.01,-3.46 -0.01,-5.19 0.01,-4.24 -0.27,-2.43 -1.6,-3.46l0 -94.76c0,-12.08 0.52,-21.71 -5.17,-32.7 -3.19,-6.16 -5.31,-8.9 -9.92,-13.73 -1.4,-1.47 -1.66,-1.46 -2.52,-2.29 -0.83,-0.8 -1.74,-1.5 -2.66,-2.15l-5.7 -3.72c-1.05,-0.62 -1.97,-1.03 -3.07,-1.55 -7.67,-3.66 -14.86,-4.8 -23.65,-4.8l-245.71 0c-12.16,-0 -20.93,-0.1 -31.97,5.91 -6.07,3.3 -6.55,4.25 -11.09,7.95l-3.46 3.65c-4.96,6.09 -8.51,12.02 -10.61,20.15 -1.56,6.04 -1.61,10.51 -1.61,17.13 0,12.57 0.01,25.14 -0,37.7l-2.02 0.02z" />
          <path className="fil1" d="M352.17 695.66c-0.7,8.07 -3.7,16.42 -8.46,22.87 -1.67,2.26 -2.85,3.6 -4.81,5.56 -2.55,2.55 -3.75,3.61 -6.8,5.69 -0.85,0.58 -1.67,1.13 -2.6,1.63 -13.23,7.14 -19.43,6.32 -35.57,6.32l-234.36 0c-5.74,0 -10.12,-0.26 -15.07,-1.65 -4.03,-1.12 -8.59,-3.05 -11.68,-5.05 -6.84,-4.43 -12.61,-9.92 -16.48,-17.14 -5.35,-10 -5.7,-16.62 -5.7,-27.86l0 -619.53c0,-5.37 -0.3,-11.67 0.16,-16.91 1.67,-18.78 14.47,-32.81 28.38,-38.43 10.17,-4.11 18.01,-3.46 29.99,-3.46l234.36 0c10.79,0 18.8,1.87 26.71,6.73 6.76,4.15 12.39,9.99 16.44,17.18 5.18,9.21 5.67,17.21 5.67,27.78l0 619.53c0,5.37 0.26,11.58 -0.19,16.72zm2.67 -1.35c-0.19,-22.36 0.01,-45.02 0.01,-67.47l0 -473.25c0,-33.83 0.19,-67.67 -0,-101.51 -0.04,-7.64 -1.73,-13.92 -4.85,-20.49l-1.5 -2.73c-0.18,-0.26 -0.01,0.02 -0.24,-0.32l-3.63 -5.41c-0.3,-0.39 -0.09,-0.17 -0.44,-0.52l-2.94 -3.42c-0.38,-0.38 -0.67,-0.75 -1.08,-1.03 -1.32,-0.93 -0.85,-0.7 -1.76,-1.5l-3.79 -2.94c-0.03,-0.03 -0.07,-0.06 -0.1,-0.09 -1.68,-1.34 -6.27,-3.76 -8.44,-4.62 -1.08,-0.43 -1.98,-0.77 -3.05,-1.18 -7.41,-2.82 -14.72,-2.45 -22.75,-2.45l-236.67 0c-4.53,0 -12.35,-0.38 -16.21,0.52 -5.87,1.38 -8.84,2.28 -14.18,4.85l-2.72 1.54c-0.68,0.37 -0.18,0.03 -0.68,0.46l-2.37 1.67c-0.03,0.02 -0.08,0.06 -0.11,0.08l-0.44 0.32c-0.03,0.02 -0.08,0.06 -0.11,0.08l-0.42 0.35c-0.03,0.03 -0.07,0.07 -0.1,0.09l-1.81 1.46c-1.03,0.66 -2.24,2.21 -3.19,3.14 -0.34,0.33 -0.84,0.68 -1.13,0.99l-6.82 10.09c-3.16,6.37 -4.95,12.68 -5.08,19.99 -0.19,11.19 -0,22.55 -0,33.76l0 608.58c-0.01,10.35 3.09,18.26 7.88,25.76l3.64 4.82c0.81,1.24 2.14,2.14 3.16,3.19 0.34,0.35 0.66,0.83 0.98,1.12l1.01 0.71c0.03,0.03 0.07,0.07 0.1,0.09 0.03,0.03 0.07,0.07 0.09,0.1l1.37 1.13c0.03,0.03 0.07,0.06 0.1,0.09 0.03,0.03 0.08,0.06 0.11,0.09 0.82,0.65 2.73,2.1 3.95,2.75 3.13,1.66 5.79,3.08 9.28,4.39 2.18,0.82 4.26,1.15 6.69,1.72 4.92,1.15 10.7,0.74 16.04,0.74l245.13 0c1.41,-0 2.64,0.01 4,-0.05 1.1,-0.04 2.51,-0.36 3.75,-0.51 3.37,-0.39 6.79,-1.74 9.89,-2.77 1.13,-0.37 4.73,-2.13 5.65,-2.81l6.28 -4.27c0.42,-0.34 0.13,-0.18 0.61,-0.54l1.07 -1.05c0.61,-0.64 1.11,-0.66 1.75,-1.33l7.33 -9.6c1.7,-2.68 3.07,-5.57 4.09,-8.57 1.28,-3.76 2.68,-9.69 2.64,-14.25z" />
          <path className="fil2" d="M204.14 26.24c0.58,-2.17 3.87,-3.61 6.06,-3.26l1.02 0.35c2.1,0.33 5.44,3.45 3.19,8.05 -0.45,0.92 -1.27,1.69 -2.3,2.18 -1.09,0.52 -2.4,0.75 -3.71,0.52 -1.75,-0.31 -3.3,-1.35 -3.95,-2.69 -0.8,-1.65 -1.19,-3.55 -0.31,-5.15zm-57.19 -10.95c-13.53,2.24 -15.25,19.52 -3.76,24.91 3.76,1.77 8.61,1.23 13.27,1.23l43.83 0c9.24,0 18.27,1.9 23.45,-5.48 4.63,-6.6 2.57,-15.82 -5.05,-19.54 -3.66,-1.79 -8.8,-1.22 -13.4,-1.22 -2.01,0 -56.24,-0.25 -58.35,0.1z" />
          <path className="fil3" d="M17.47 16.53c2.47,-1.39 6.58,-5.98 15.49,-10.07 5.87,-2.69 13.29,-5.04 20.65,-5.03l243.4 0.38c9.14,0.01 23.33,3.3 31.16,7.39l6.23 3.41c0.69,0.45 1.24,0.89 1.92,1.33 5.02,3.27 11.08,9.53 14.14,14.5 4.77,7.73 8.27,18 8.28,27.39l0.12 -2.98c-0.22,-2.76 -0.61,-5.91 -1.15,-8.6 -0.72,-3.57 -1.48,-6.74 -2.74,-10.12 -4.71,-12.6 -11.83,-21.5 -24.41,-27.11 -6.23,-2.77 -12.83,-4.78 -20.06,-5.89 -7.48,-1.15 -16.83,-0.85 -24.82,-0.85l-206.87 -0.1c-6.39,0 -19.88,-0.06 -25.62,0.34 -17.16,1.21 -26.84,7.33 -35.7,15.98z" />
          <path className="fil4" d="M204.14 26.24c-0.88,1.6 -0.49,3.51 0.31,5.15 0.65,1.35 2.2,2.39 3.95,2.69 1.3,0.23 2.61,0 3.71,-0.52 1.03,-0.49 1.85,-1.26 2.3,-2.18 2.25,-4.6 -1.09,-7.72 -3.19,-8.05l-0.49 0.15 0.74 0.92c-0.26,0.8 -0.08,0.08 -0.48,0.78 2.04,0.53 1.8,4.5 1.06,4.43l-0.26 -0.02c-0.62,-0.18 -0.12,-0.51 -1.17,-0.38 -0.41,0.8 -0.22,0.84 0.16,1.24l0.38 0.38c-2.49,1.05 -4.42,0.2 -4.84,-2.14 -0.42,0.83 -0.78,0.28 -1.09,-0.17l-0.31 0.74c-0.03,-0.04 -0.08,-0.09 -0.1,-0.11 -0.02,-0.02 -0.07,-0.08 -0.1,-0.11 -0.03,-0.03 -0.07,-0.07 -0.1,-0.1 -0.03,-0.03 -0.07,-0.07 -0.1,-0.1 -0.95,-1.06 -0.15,-1.93 -0.38,-2.62z" />
          <path className="fil5" d="M204.14 26.24c0.23,0.69 -0.57,1.56 0.38,2.62 0.03,0.03 0.07,0.07 0.1,0.1 0.03,0.03 0.07,0.07 0.1,0.1 0.03,0.03 0.08,0.08 0.1,0.11 0.02,0.02 0.07,0.07 0.1,0.11l0.31 -0.74c0.32,0.44 0.67,1 1.09,0.17 0.42,2.34 2.35,3.19 4.84,2.14l-0.38 -0.38c-0.38,-0.4 -0.57,-0.44 -0.16,-1.24 1.05,-0.13 0.55,0.19 1.17,0.38l0.26 0.02c0.75,0.07 0.99,-3.9 -1.06,-4.43 0.4,-0.71 0.22,0.02 0.48,-0.78l-0.74 -0.92 0.49 -0.15 -1.02 -0.35c-2.2,-0.35 -5.48,1.08 -6.06,3.26z" />
        </g>
      </svg>
    </div>
  );
};
