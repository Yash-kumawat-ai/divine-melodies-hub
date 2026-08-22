import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { WallpaperPage as ModularWallpaperPage } from "./wallpaper/WallpaperPage";

export default function WallpaperPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [likedWallpaperIds, setLikedWallpaperIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_liked_wallpapers") || "[]");
    } catch (_) {
      return [];
    }
  });

  const handleToggleLike = (wpId: string) => {
    setLikedWallpaperIds((prev) => {
      const next = prev.includes(wpId) ? prev.filter((id) => id !== wpId) : [...prev, wpId];
      try {
        localStorage.setItem("hk_liked_wallpapers", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  return (
    <ModularWallpaperPage
      isDark={isDark}
      isHi={isHi}
      likedWallpaperIds={likedWallpaperIds}
      userTier="free"
      onToggleLikeWallpaper={handleToggleLike}
      onNavigateToPricing={() => navigate("/pricing")}
      onNavigateBack={() => navigate("/")}
      activeTab="wallpapers"
      onSelectTab={(tab) => navigate(`/blessings?tab=${tab}`)}
    />
  );
}
