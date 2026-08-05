import type { DeityFilterItem } from "../types";
import basuriSvg from "@/pages/images/svg/basuri.svg";
import shivWallpaperImg from "@/pages/images/shiv_wallpaper.webp";
import deityRamImg from "@/pages/images/deity-ram.webp";
import krishnaImg from "@/pages/images/krishna main.webp";
import hanumanImg from "@/pages/images/Hanumanji_HD_WebP.webp";
import radhaKrishnaImg from "@/pages/images/radha_krishna_hd mayapur tv.webp";
import shyamMandirImg from "@/pages/images/shyam_mandir_desktop_hd.webp";

export const DEITY_FILTER_LIST: DeityFilterItem[] = [
  { id: null,          name: "सभी",    nameEn: "All",    isIcon: true,  symbol: "", image: basuriSvg },
  { id: "Shiva",        name: "शिव",    nameEn: "Shiva",  isIcon: false, symbol: "", image: shivWallpaperImg },
  { id: "Rama",         name: "राम",    nameEn: "Ram",    isIcon: false, symbol: "", image: deityRamImg },
  { id: "Krishna",      name: "कृष्ण",  nameEn: "Krishna",isIcon: false, symbol: "", image: krishnaImg },
  { id: "Hanuman",      name: "हनुमान", nameEn: "Hanuman",isIcon: false, symbol: "", image: hanumanImg },
  { id: "Radha",        name: "राधा",   nameEn: "Radha",  isIcon: false, symbol: "", image: radhaKrishnaImg },
  { id: "Khatu Shyam",  name: "श्याम",  nameEn: "Shyam",  isIcon: false, symbol: "", image: shyamMandirImg },
];
