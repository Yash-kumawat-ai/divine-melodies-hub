import type {
  DailyDarshan,
  DevotionalWallpaper,
  DevotionalLiveWallpaper,
  PosterTemplate,
} from "./types";

// ─── LOCAL DEITY IMAGES IMPORTS ───────────────────────────────────
import shreeRamImg from "../images/shree_ram_ultra_hd.webp";
import shivVerticalImg from "../images/shiv_vertical_wallpaper.webp";
import hanumanImg from "../images/Hanumanji_HD_WebP.webp";
import ganeshImg from "../images/ganesh.webp";
import krishnaImg from "../images/krishna main.webp";
import lakshmiImg from "../images/red_lotus_lossless.webp";
import salasarBalajiImg from "../images/salasar_balaji desktop.webp";

// Wallpapers
import kashiVishwanathImg from "../images/kashi vishwanath.webp";
import shivTempleHdImg from "../images/shiv_temple_hd.webp";
import shivWallpaperImg from "../images/shiv_wallpaper.webp";
import deityRamImg from "../images/deity-ram.webp";
import radhaKrishnaImg from "../images/radha_krishna_hd mayapur tv.webp";
import krishnaMobileImg from "../images/krishna_mobile_wallpaper.webp";
import shyamMandirImg from "../images/shyam_mandir_desktop_hd.webp";
import khatuShyamHdImg from "../images/khatu_shyam_hd.webp";

// ─── DAILY DARSHANS ────────────────────────────────────────────────
export const DAILY_DARSHANS: Record<number, DailyDarshan> = {
  0: {
    id: "sun-ram",
    deity: "Lord Rama",
    deityHindi: "श्री राम",
    imageUrl: shreeRamImg,
    templeName: "Ayodhya Ram Mandir",
    templeNameHindi: "अयोध्या राम मंदिर",
    quote: "May Lord Rama bless you with righteousness, character, and eternal peace.",
    quoteHindi: "श्री राम आपको धर्म, चरित्र और परम शांति का आशीर्वाद प्रदान करें।",
  },
  1: {
    id: "mon-shiva",
    deity: "Lord Shiva",
    deityHindi: "भगवान शिव",
    imageUrl: shivVerticalImg,
    templeName: "Kashi Vishwanath Temple",
    templeNameHindi: "काशी विश्वनाथ मंदिर",
    quote: "May Lord Shiva dissolve all your troubles and bless you with deep calm and meditation.",
    quoteHindi: "भगवान शिव आपके सभी संकटों को दूर करें और आपको शांत मन व ध्यान प्रदान करें।",
  },
  2: {
    id: "tue-hanuman",
    deity: "Lord Hanuman",
    deityHindi: "हनुमान जी",
    imageUrl: hanumanImg,
    templeName: "Salasar Balaji Dham",
    templeNameHindi: "सालासर बालाजी धाम",
    quote: "May Hanuman Ji remove all obstacles and bless you with strength, courage, and true devotion.",
    quoteHindi: "हनुमान जी आपके मार्ग के सभी विघ्नों को दूर कर आपको बल, साहस और भक्ति प्रदान करें।",
  },
  3: {
    id: "wed-ganesha",
    deity: "Lord Ganesha",
    deityHindi: "गणेश जी",
    imageUrl: ganeshImg,
    templeName: "Siddhivinayak Temple",
    templeNameHindi: "सिद्धिविनायक मंदिर",
    quote: "May Lord Ganesha remove all obstacles and grant you wisdom, success, and prosperity.",
    quoteHindi: "गणेश जी आपके सभी संकटों को हरें और आपको बुद्धि, ऋद्धि-सिद्धि और सौभाग्य प्रदान करें।",
  },
  4: {
    id: "thu-krishna",
    deity: "Lord Krishna",
    deityHindi: "श्री कृष्ण",
    imageUrl: krishnaImg,
    templeName: "Banke Bihari Temple",
    templeNameHindi: "बांके बिहारी मंदिर",
    quote: "May Lord Krishna fill your life with love, joy, playfulness, and pure devotion.",
    quoteHindi: "श्री कृष्ण आपके जीवन को प्रेम, आनंद, दिव्य लीला और विशुद्ध भक्ति से सराबोर कर दें।",
  },
  5: {
    id: "fri-lakshmi",
    deity: "Mata Lakshmi",
    deityHindi: "माता लक्ष्मी",
    imageUrl: lakshmiImg,
    templeName: "Mahalakshmi Temple",
    templeNameHindi: "महालक्ष्मी मंदिर",
    quote: "May Mata Lakshmi bless your home with prosperity, abundance, health, and peace.",
    quoteHindi: "माता लक्ष्मी आपके घर को सुख, समृद्धि, अच्छे स्वास्थ्य और शांति से परिपूर्ण करें।",
  },
  6: {
    id: "sat-hanuman",
    deity: "Lord Hanuman",
    deityHindi: "हनुमान जी",
    imageUrl: salasarBalajiImg,
    templeName: "Sankat Mochan Temple",
    templeNameHindi: "संकट मोचन मंदिर",
    quote: "May Hanuman Ji guard you against negative energy and bless you with peace and wisdom.",
    quoteHindi: "हनुमान जी नकारात्मक ऊर्जा से आपकी रक्षा करें और आपको शांति और विवेक का आशीर्वाद दें।",
  },
};

// ─── STATIC WALLPAPERS ─────────────────────────────────────────────
export const WALLPAPERS_LIST: DevotionalWallpaper[] = [
  { id: "wp-shiva-1", deity: "Shiva", name: "Kashi Vishwanath Jyotirlinga", nameHindi: "काशी विश्वनाथ ज्योतिर्लिंग", imageUrl: kashiVishwanathImg, tier: "free", category: "todays" },
  { id: "wp-shiva-2", deity: "Shiva", name: "Shiv Temple Darshan", nameHindi: "शिव मंदिर दर्शन", imageUrl: shivTempleHdImg, tier: "free", category: "todays" },
  { id: "wp-shiva-3", deity: "Shiva", name: "Meditating Shiva", nameHindi: "ध्यानमग्न शिव", imageUrl: shivWallpaperImg, tier: "free", category: "todays" },
  { id: "wp-ram-1", deity: "Rama", name: "Shree Ram Darshan", nameHindi: "श्री राम दर्शन", imageUrl: deityRamImg, tier: "free", category: "todays" },
  { id: "wp-ram-2", deity: "Rama", name: "Shree Ram Darbar HD", nameHindi: "श्री राम दरबार एचडी", imageUrl: shreeRamImg, tier: "free", category: "festival" },
  { id: "wp-krishna-1", deity: "Krishna", name: "Banke Bihari Devotion", nameHindi: "बांके बिहारी भक्ति", imageUrl: krishnaImg, tier: "free", category: "festival" },
  { id: "wp-krishna-2", deity: "Krishna", name: "Radha Krishna Mayapur", nameHindi: "राधा कृष्ण मायापुर", imageUrl: radhaKrishnaImg, tier: "free", category: "suprabhat" },
  { id: "wp-krishna-3", deity: "Krishna", name: "Krishna Mobile Wallpaper", nameHindi: "कृष्ण मोबाइल वॉलपेपर", imageUrl: krishnaMobileImg, tier: "free", category: "quotes" },
  { id: "wp-hanuman-1", deity: "Hanuman", name: "Hanumanji HD Portrait", nameHindi: "हनुमानजी एचडी पोर्ट्रेट", imageUrl: hanumanImg, tier: "free", category: "suprabhat" },
  { id: "wp-shyam-1", deity: "Khatu Shyam", name: "Shyam Mandir Desktop", nameHindi: "श्याम मंदिर डेस्कटॉप", imageUrl: shyamMandirImg, tier: "free", category: "quotes" },
];

// ─── LIVE WALLPAPERS ───────────────────────────────────────────────
export const LIVE_WALLPAPERS_LIST: DevotionalLiveWallpaper[] = [
  { id: "live-krishna-1", deity: "Krishna", name: "Vrindavan Raas Leela", nameHindi: "वृंदावन रास लीला सजीव", thumbnailUrl: radhaKrishnaImg, effect: "petals", tier: "free", category: "festival" },
  { id: "live-shiva-1", deity: "Shiva", name: "Kailash Meditating Shiva", nameHindi: "कैलाश ध्यानमग्न शिव सजीव", thumbnailUrl: shivWallpaperImg, effect: "aura", tier: "free", category: "todays" },
  { id: "live-ram-1", deity: "Rama", name: "Ayodhya Mandir Deepotsav", nameHindi: "अयोध्या मंदिर दीपोत्सव सजीव", thumbnailUrl: deityRamImg, effect: "flame", tier: "free", category: "festival" },
  { id: "live-hanuman-1", deity: "Hanuman", name: "Anjaneya Shaurya Darshan", nameHindi: "आंजनेय शौर्य दर्शन सजीव", thumbnailUrl: hanumanImg, effect: "shimmer", tier: "free", category: "todays" },
];

// ─── WALLPAPER SECTIONS ────────────────────────────────────────────
export const WALLPAPER_SECTIONS = [
  { key: "todays", name: "Today's Specials", nameHindi: "आज के विशेष", icon: "✨" },
  { key: "festival", name: "Festival Specials", nameHindi: "उत्सव पावन वॉलपेपर", icon: "🎉" },
  { key: "suprabhat", name: "Suprabhat / Morning", nameHindi: "सुप्रभात पावन स्मरण", icon: "☀️" },
  { key: "quotes", name: "Mantras & Quotes", nameHindi: "मंत्र और दिव्य सुविचार", icon: "📜" },
] as const;

// ─── WEEKDAYS ──────────────────────────────────────────────────────
export const WEEKDAYS = [
  { dayNum: 0, label: "Sun", labelHi: "रवि", deity: "Rama" },
  { dayNum: 1, label: "Mon", labelHi: "सोम", deity: "Shiva" },
  { dayNum: 2, label: "Tue", labelHi: "मंगल", deity: "Hanuman" },
  { dayNum: 3, label: "Wed", labelHi: "बुध", deity: "Ganesha" },
  { dayNum: 4, label: "Thu", labelHi: "गुरु", deity: "Krishna" },
  { dayNum: 5, label: "Fri", labelHi: "शुक्र", deity: "Lakshmi" },
  { dayNum: 6, label: "Sat", labelHi: "शनि", deity: "Hanuman" },
];

// ─── POSTER TEMPLATES ──────────────────────────────────────────────
export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: "poster-shyam-1",
    title: "Khatu Shyam Poster",
    titleHindi: "जय श्री श्याम",
    subtitle: "Poster",
    subtitleHindi: "हारे का सहारा",
    category: "todays",
    imageUrl: khatuShyamHdImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Baba Shyam will bless your day",
    quoteHindi: "बाबा श्याम की कृपा आप पर सदा बनी रहे",
    allowShapeChange: true,
    defaultShape: "circle",
  },
  {
    id: "poster-hanuman-1",
    title: "Hanuman Poster",
    titleHindi: "जय बजरंग बली",
    subtitle: "Poster",
    subtitleHindi: "संकट मोचन",
    category: "todays",
    imageUrl: hanumanImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Lord Hanuman will protect you",
    quoteHindi: "हनुमान जी आपके सभी संकट दूर करें",
    allowShapeChange: true,
    defaultShape: "circle",
  },
  {
    id: "poster-krishna-1",
    title: "Radhe Radhe Poster",
    titleHindi: "राधे राधे",
    subtitle: "Poster",
    subtitleHindi: "राधे राधे",
    category: "todays",
    imageUrl: radhaKrishnaImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "May Radha Krishna bless you",
    quoteHindi: "राधा कृष्ण का पावन आशीर्वाद",
    allowShapeChange: true,
    defaultShape: "circle",
  },
  {
    id: "poster-morning-1",
    title: "Surya Dev Morning",
    titleHindi: "सुप्रभात सूर्य देव",
    subtitle: "Morning",
    subtitleHindi: "शुभ प्रभात",
    category: "good_morning",
    imageUrl: shreeRamImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Wishing you a positive and blessed morning",
    quoteHindi: "ॐ सूर्याय नमः। आपका आज का दिन मंगलमय हो।",
    allowShapeChange: true,
    defaultShape: "circle",
  },
  {
    id: "poster-fest-1",
    title: "Janmashtami Special",
    titleHindi: "जन्माष्टमी विशेष",
    subtitle: "26 Aug",
    subtitleHindi: "26 अगस्त",
    category: "festival",
    imageUrl: krishnaMobileImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Happy Janmashtami",
    quoteHindi: "कृष्ण जन्माष्टमी की पावन शुभकामनाएं",
    allowShapeChange: true,
    defaultShape: "circle",
  },
  {
    id: "poster-fest-2",
    title: "Ganesh Chaturthi",
    titleHindi: "गणेश चतुर्थी",
    subtitle: "7 Sep",
    subtitleHindi: "7 सितम्बर",
    category: "festival",
    imageUrl: ganeshImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Ganpati Bappa Morya",
    quoteHindi: "गणपति बाप्पा मोरया",
    allowShapeChange: true,
    defaultShape: "circle",
  },
  {
    id: "poster-fest-3",
    title: "Navratri Special",
    titleHindi: "नवरात्रि विशेष",
    subtitle: "3 Oct",
    subtitleHindi: "3 अक्टूबर",
    category: "festival",
    imageUrl: shivVerticalImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Shubh Navratri",
    quoteHindi: "नवरात्रि की हार्दिक शुभकामनाएं",
    allowShapeChange: true,
    defaultShape: "circle",
  },
];
