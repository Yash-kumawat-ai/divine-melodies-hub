export type KirtanDeity = "Krishna" | "Shiva" | "Devi" | "Ganesh" | "Hanuman" | "General";
export type KirtanLanguage = "Hindi" | "Sanskrit" | "Gujarati" | "Marathi" | "Other";
export type KirtanMood = "Morning Prayer" | "Meditation" | "Festival" | "Grief" | "Celebration" | "Aarti";

export interface KirtanBhajan {
  id: string;
  name: string;
  aliases: string[];
  keywords: string[];
  deity: KirtanDeity;
  language: KirtanLanguage;
  mood: KirtanMood[];
  lyrics_preview: string;
  youtube_link: string;
  singer: string;
}

export interface AddBhajanDraft {
  name?: string;
  deity?: KirtanDeity;
  language?: KirtanLanguage;
  lyrics_preview?: string;
  singer?: string;
  youtube_link?: string;
}

export const SAVED_BHAJANS_KEY = "kirtan_ai_saved_bhajans";

type BaseKirtanBhajan = Omit<KirtanBhajan, "keywords">;

export const OFFLINE_BHAJANS: KirtanBhajan[] = ([
  { id: "krishna-achyutam", name: "Achyutam Keshavam", aliases: ["Achyutam Keshavam Krishna Damodaram", "Achyutam"], deity: "Krishna", language: "Sanskrit", mood: ["Meditation", "Morning Prayer"], lyrics_preview: "Achyutam Keshavam Krishna Damodaram\nRama Naraynam Janaki Vallabham\nKaun kehte hain Bhagwan aate nahi\nTum Meera ke jaise bulate nahi", youtube_link: "https://www.youtube.com/results?search_query=Achyutam+Keshavam", singer: "Traditional" },
  { id: "krishna-hare", name: "Hare Krishna Mahamantra", aliases: ["Hare Krishna Hare Rama", "Mahamantra"], deity: "Krishna", language: "Sanskrit", mood: ["Meditation", "Festival"], lyrics_preview: "Hare Krishna Hare Krishna\nKrishna Krishna Hare Hare\nHare Rama Hare Rama\nRama Rama Hare Hare", youtube_link: "https://www.youtube.com/results?search_query=Hare+Krishna+Mahamantra", singer: "Traditional" },
  { id: "krishna-govind-bolo", name: "Govind Bolo Hari Gopal Bolo", aliases: ["Govind Bolo", "Hari Gopal Bolo"], deity: "Krishna", language: "Hindi", mood: ["Celebration", "Festival"], lyrics_preview: "Govind bolo Hari Gopal bolo\nRadha Raman Hari Gopal bolo\nGovind bolo Hari Gopal bolo\nRadha Raman Hari Gopal bolo", youtube_link: "https://www.youtube.com/results?search_query=Govind+Bolo+Hari+Gopal+Bolo", singer: "Traditional" },
  { id: "krishna-radha-raman", name: "Radhe Radhe Japo", aliases: ["Radhe Radhe", "Radha Naam"], deity: "Krishna", language: "Hindi", mood: ["Meditation", "Celebration"], lyrics_preview: "Radhe Radhe japo chale aayenge Bihari\nRadhe Radhe japo chale aayenge Bihari\nRadha naam bada sukhdayi\nRadha naam bada pyara", youtube_link: "https://www.youtube.com/results?search_query=Radhe+Radhe+Japo", singer: "Traditional" },
  { id: "krishna-shyam-teri-bansi", name: "Shyam Teri Bansi", aliases: ["Shyam Teri Bansi Pukare Radha Naam", "Teri Bansi"], deity: "Krishna", language: "Hindi", mood: ["Celebration", "Festival"], lyrics_preview: "Shyam teri bansi pukare Radha naam\nLog kare Meera ko yunhi badnaam\nShyam teri bansi pukare Radha naam\nRadha ka bhi Shyam woh to Meera ka bhi Shyam", youtube_link: "https://www.youtube.com/results?search_query=Shyam+Teri+Bansi", singer: "Anup Jalota" },
  { id: "krishna-madhurashtakam", name: "Madhurashtakam", aliases: ["Adharam Madhuram", "Madhuram Madhuram"], deity: "Krishna", language: "Sanskrit", mood: ["Meditation", "Morning Prayer"], lyrics_preview: "Adharam madhuram vadanam madhuram\nNayanam madhuram hasitam madhuram\nHridayam madhuram gamanam madhuram\nMadhuradhipater akhilam madhuram", youtube_link: "https://www.youtube.com/results?search_query=Madhurashtakam", singer: "Traditional" },
  { id: "krishna-yashomati", name: "Yashomati Maiya Se Bole Nandlala", aliases: ["Yashomati Maiya", "Nandlala"], deity: "Krishna", language: "Hindi", mood: ["Celebration"], lyrics_preview: "Yashomati maiya se bole Nandlala\nRadha kyun gori main kyun kala\nBoli muskaati maiya lalan ko batati\nKaali andhiyari aadhi raat mein tu aaya", youtube_link: "https://www.youtube.com/results?search_query=Yashomati+Maiya+Se+Bole+Nandlala", singer: "Lata Mangeshkar" },
  { id: "krishna-meera", name: "Mere To Giridhar Gopal", aliases: ["Giridhar Gopal", "Meera Bhajan"], deity: "Krishna", language: "Hindi", mood: ["Grief", "Meditation"], lyrics_preview: "Mere to Giridhar Gopal doosro na koi\nJaake sir mor mukut mero pati soi\nMere to Giridhar Gopal doosro na koi\nChhod diyo kul ki kaan", youtube_link: "https://www.youtube.com/results?search_query=Mere+To+Giridhar+Gopal", singer: "Meera Bai" },
  { id: "krishna-aarti-kunj", name: "Aarti Kunj Bihari Ki", aliases: ["Kunj Bihari Aarti", "Krishna Aarti"], deity: "Krishna", language: "Hindi", mood: ["Aarti", "Festival"], lyrics_preview: "Aarti Kunj Bihari ki\nShri Giridhar Krishna Murari ki\nGale mein baijanti mala\nBajave murali madhur bala", youtube_link: "https://www.youtube.com/results?search_query=Aarti+Kunj+Bihari+Ki", singer: "Traditional" },
  { id: "krishna-jagjit", name: "Hey Govind Hey Gopal", aliases: ["Hey Govind", "Hey Gopal"], deity: "Krishna", language: "Hindi", mood: ["Grief", "Meditation"], lyrics_preview: "Hey Govind hey Gopal\nHey Dayal Lal\nPran nath anath sakhe\nDeen dard nivar", youtube_link: "https://www.youtube.com/results?search_query=Hey+Govind+Hey+Gopal", singer: "Jagjit Singh" },
  { id: "shiva-om-namah", name: "Om Namah Shivaya", aliases: ["Namah Shivaya", "Om Namah Shivay"], deity: "Shiva", language: "Sanskrit", mood: ["Meditation", "Morning Prayer"], lyrics_preview: "Om Namah Shivaya\nOm Namah Shivaya\nHar Har Bole Namah Shivaya\nShiv Shiv Bole Namah Shivaya", youtube_link: "https://www.youtube.com/results?search_query=Om+Namah+Shivaya", singer: "Traditional" },
  { id: "shiva-bam-bam", name: "Bam Bam Bole", aliases: ["Bam Bam Bhole", "Bhole Baba"], deity: "Shiva", language: "Hindi", mood: ["Festival", "Celebration"], lyrics_preview: "Bam Bam Bole masti mein dole\nBhole Baba ki jai\nHar Har Mahadev gunje\nShiv Shankar ki jai", youtube_link: "https://www.youtube.com/results?search_query=Bam+Bam+Bole+Shiva", singer: "Traditional" },
  { id: "shiva-tandav", name: "Shiv Tandav Stotram", aliases: ["Shiva Tandava", "Jatatavigalajjala"], deity: "Shiva", language: "Sanskrit", mood: ["Meditation", "Festival"], lyrics_preview: "Jatatavigalajjala pravahapavitasthale\nGale avalambya lambitam bhujangatungamalikam\nDamad damad damaddama ninadavadamarvayam\nChakara chandtandavam tanotu nah Shivah shivam", youtube_link: "https://www.youtube.com/results?search_query=Shiv+Tandav+Stotram", singer: "Traditional" },
  { id: "shiva-jai-shiv-omkara", name: "Om Jai Shiv Omkara", aliases: ["Jai Shiv Omkara", "Shiva Aarti"], deity: "Shiva", language: "Hindi", mood: ["Aarti", "Evening Prayer" as KirtanMood], lyrics_preview: "Om Jai Shiv Omkara\nSwami Jai Shiv Omkara\nBrahma Vishnu Sadashiv\nArdhangi Dhara", youtube_link: "https://www.youtube.com/results?search_query=Om+Jai+Shiv+Omkara", singer: "Traditional" },
  { id: "shiva-mahamrityunjaya", name: "Mahamrityunjaya Mantra", aliases: ["Tryambakam Yajamahe", "Mahamrityunjaya"], deity: "Shiva", language: "Sanskrit", mood: ["Meditation", "Grief"], lyrics_preview: "Om Tryambakam Yajamahe\nSugandhim Pushtivardhanam\nUrvarukamiva Bandhanan\nMrityor Mukshiya Maamritat", youtube_link: "https://www.youtube.com/results?search_query=Mahamrityunjaya+Mantra", singer: "Traditional" },
  { id: "shiva-har-har", name: "Har Har Mahadev", aliases: ["Har Har Shambhu", "Mahadev Shambhu"], deity: "Shiva", language: "Hindi", mood: ["Festival", "Celebration"], lyrics_preview: "Har Har Mahadev Shambhu\nKashi Vishwanath Gange\nMata Parvati Sange\nHar Har Mahadev Shambhu", youtube_link: "https://www.youtube.com/results?search_query=Har+Har+Mahadev+Shambhu", singer: "Traditional" },
  { id: "shiva-namo-namo", name: "Namo Namo Shankara", aliases: ["Namo Namo Ji Shankara", "Kedarnath Shiva"], deity: "Shiva", language: "Hindi", mood: ["Meditation", "Grief"], lyrics_preview: "Jai ho jai ho Shankara\nBholenath Shankara\nAadi dev Shankara\nHey Shivay Shankara", youtube_link: "https://www.youtube.com/results?search_query=Namo+Namo+Shankara", singer: "Amit Trivedi" },
  { id: "shiva-shivoham", name: "Shivoham", aliases: ["Nirvana Shatakam", "Mano Buddhi Ahankara"], deity: "Shiva", language: "Sanskrit", mood: ["Meditation"], lyrics_preview: "Mano buddhyahankara chittani naham\nNa cha shrotra jihve na cha ghrana netre\nNa cha vyoma bhumir na tejo na vayuh\nChidananda rupah Shivoham Shivoham", youtube_link: "https://www.youtube.com/results?search_query=Shivoham+Nirvana+Shatakam", singer: "Traditional" },
  { id: "devi-jai-mata", name: "Jai Mata Di", aliases: ["Mata Rani Bhajan", "Jai Mata Di Bol"], deity: "Devi", language: "Hindi", mood: ["Festival", "Celebration"], lyrics_preview: "Jai Mata Di Jai Mata Di\nMata Rani ki jai\nSherawali Mata ki jai\nAmbe Gauri ki jai", youtube_link: "https://www.youtube.com/results?search_query=Jai+Mata+Di+Bhajan", singer: "Traditional" },
  { id: "devi-durge-durgat", name: "Durge Durgat Bhari", aliases: ["Durga Aarti Marathi", "Durge Durgat Bhari Tujvin"], deity: "Devi", language: "Marathi", mood: ["Aarti", "Festival"], lyrics_preview: "Durge durgat bhari tujvin sansari\nAnath nathe ambe karuna vistari\nVari vari janma maranate vari\nHari padalo ata sankat nivari", youtube_link: "https://www.youtube.com/results?search_query=Durge+Durgat+Bhari", singer: "Traditional" },
  { id: "devi-aigiri", name: "Aigiri Nandini", aliases: ["Mahishasura Mardini Stotram", "Aigiri Nandini Nanditha"], deity: "Devi", language: "Sanskrit", mood: ["Festival", "Meditation"], lyrics_preview: "Aigiri nandini nanditha medini\nVishva vinodini nandinute\nGirivara vindhya shirodhi nivasini\nVishnu vilasini jishnu nute", youtube_link: "https://www.youtube.com/results?search_query=Aigiri+Nandini", singer: "Traditional" },
  { id: "devi-ambe-tu-hai", name: "Ambe Tu Hai Jagdambe Kali", aliases: ["Ambe Aarti", "Jagdambe Kali"], deity: "Devi", language: "Hindi", mood: ["Aarti", "Festival"], lyrics_preview: "Ambe tu hai Jagdambe Kali\nJai Durge Khapparwali\nTere hi gun gaaye Bharati\nO Maiya hum sab utare teri aarti", youtube_link: "https://www.youtube.com/results?search_query=Ambe+Tu+Hai+Jagdambe+Kali", singer: "Traditional" },
  { id: "devi-jai-ambe", name: "Jai Ambe Gauri", aliases: ["Ambe Gauri Aarti", "Durga Aarti"], deity: "Devi", language: "Hindi", mood: ["Aarti", "Festival"], lyrics_preview: "Jai Ambe Gauri Maiya Jai Shyama Gauri\nTumko nishdin dhyavat Hari Brahma Shivri\nMang sindoor virajat tiko mrigmad ko\nUjjwal se dou naina chandra vadan niko", youtube_link: "https://www.youtube.com/results?search_query=Jai+Ambe+Gauri", singer: "Traditional" },
  { id: "devi-ya-devi", name: "Ya Devi Sarva Bhuteshu", aliases: ["Ya Devi Mantra", "Devi Suktam"], deity: "Devi", language: "Sanskrit", mood: ["Meditation", "Festival"], lyrics_preview: "Ya Devi sarva bhuteshu\nShakti rupena samsthita\nNamastasyai namastasyai\nNamastasyai namo namah", youtube_link: "https://www.youtube.com/results?search_query=Ya+Devi+Sarva+Bhuteshu", singer: "Traditional" },
  { id: "ganesh-jai", name: "Jai Ganesh Deva", aliases: ["Ganesh Aarti", "Jai Ganesh Jai Ganesh"], deity: "Ganesh", language: "Hindi", mood: ["Aarti", "Morning Prayer"], lyrics_preview: "Jai Ganesh Jai Ganesh Jai Ganesh Deva\nMata Jaki Parvati Pita Mahadeva\nEk dant dayavant char bhuja dhari\nMathe sindoor sohe muse ki sawari", youtube_link: "https://www.youtube.com/results?search_query=Jai+Ganesh+Deva", singer: "Traditional" },
  { id: "ganesh-vakratunda", name: "Vakratunda Mahakaya", aliases: ["Vakratunda", "Ganesh Mantra"], deity: "Ganesh", language: "Sanskrit", mood: ["Morning Prayer", "Meditation"], lyrics_preview: "Vakratunda Mahakaya\nSuryakoti Samaprabha\nNirvighnam Kurume Deva\nSarva Karyeshu Sarvada", youtube_link: "https://www.youtube.com/results?search_query=Vakratunda+Mahakaya", singer: "Traditional" },
  { id: "ganesh-ganpati-bappa", name: "Ganpati Bappa Morya", aliases: ["Ganpati Bappa", "Morya Re"], deity: "Ganesh", language: "Marathi", mood: ["Festival", "Celebration"], lyrics_preview: "Ganpati Bappa Morya\nMangal Murti Morya\nPudchya varshi lavkar ya\nGanpati Bappa Morya", youtube_link: "https://www.youtube.com/results?search_query=Ganpati+Bappa+Morya", singer: "Traditional" },
  { id: "ganesh-sukhkarta", name: "Sukhkarta Dukhharta", aliases: ["Sukhkarta Dukhharta Varta Vighnachi", "Marathi Ganesh Aarti"], deity: "Ganesh", language: "Marathi", mood: ["Aarti", "Festival"], lyrics_preview: "Sukhkarta Dukhharta Varta Vighnachi\nNurvi Purvi Prem Krupa Jayachi\nSarvangi Sundar Uti Shendurachi\nKanthi Jhalke Mal Mukta Phalanchi", youtube_link: "https://www.youtube.com/results?search_query=Sukhkarta+Dukhharta", singer: "Traditional" },
  { id: "hanuman-chalisa", name: "Hanuman Chalisa", aliases: ["Shri Hanuman Chalisa", "Jai Hanuman Gyan Gun Sagar"], deity: "Hanuman", language: "Hindi", mood: ["Morning Prayer", "Grief"], lyrics_preview: "Shri Guru Charan Saroj Raj\nNij manu mukuru sudhari\nBarnau Raghuvar Bimal Jasu\nJo dayaku phal chari", youtube_link: "https://www.youtube.com/results?search_query=Hanuman+Chalisa", singer: "Traditional" },
  { id: "hanuman-bajrang", name: "Bajrang Baan", aliases: ["Hanuman Bajrang Baan", "Nishchay Prem Prateet"], deity: "Hanuman", language: "Hindi", mood: ["Grief", "Morning Prayer"], lyrics_preview: "Nishchay prem prateet te\nVinay kare sanman\nTehi ke karaj sakal shubh\nSiddh kare Hanuman", youtube_link: "https://www.youtube.com/results?search_query=Bajrang+Baan", singer: "Traditional" },
  { id: "hanuman-sankat", name: "Sankat Mochan Hanuman Ashtak", aliases: ["Hanuman Ashtak", "Sankat Mochan"], deity: "Hanuman", language: "Hindi", mood: ["Grief", "Meditation"], lyrics_preview: "Baal samay ravi bhakshi liyo tab\nTeenahu lok bhayo andhiyaro\nTaahi so traas bhayo jag ko\nYah sankat kahu so jaat na taaro", youtube_link: "https://www.youtube.com/results?search_query=Sankat+Mochan+Hanuman+Ashtak", singer: "Traditional" },
  { id: "hanuman-aarti", name: "Aarti Kije Hanuman Lala Ki", aliases: ["Hanuman Aarti", "Aarti Hanuman Lala"], deity: "Hanuman", language: "Hindi", mood: ["Aarti", "Celebration"], lyrics_preview: "Aarti kije Hanuman Lala ki\nDusht dalan Raghunath kala ki\nJake bal se girivar kanpe\nRog dosh jake nikat na jhanke", youtube_link: "https://www.youtube.com/results?search_query=Aarti+Kije+Hanuman+Lala+Ki", singer: "Traditional" },
] as BaseKirtanBhajan[]).map((bhajan) => ({
  ...bhajan,
  keywords: [
    bhajan.deity,
    bhajan.language,
    ...bhajan.mood,
    ...bhajan.aliases,
  ].map((keyword) => keyword.trim().toLowerCase()),
}));

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDuplicateBhajan(name: string, library: KirtanBhajan[]): KirtanBhajan | null {
  const target = normalize(name);
  return library.find((bhajan) => {
    const names = [bhajan.name, ...bhajan.aliases].map(normalize);
    return names.includes(target);
  }) || null;
}

export function exactSearchBhajans(query: string, library: KirtanBhajan[]): KirtanBhajan[] {
  const target = normalize(query);
  if (!target) return [];

  return library.filter((bhajan) => {
    const title = normalize(bhajan.name);
    const exactFields = [...bhajan.aliases, ...bhajan.keywords].map(normalize);
    return title === target || exactFields.includes(target) || (target.length >= 3 && title.startsWith(target));
  });
}

export function filterByDeityAndLanguage(
  library: KirtanBhajan[],
  deity: KirtanDeity | "All",
  language: KirtanLanguage | "Regional" | "Any",
): KirtanBhajan[] {
  return library.filter((bhajan) => {
    const deityMatch = deity === "All" || bhajan.deity === deity;
    const languageMatch =
      language === "Any" ||
      (language === "Regional" && ["Gujarati", "Marathi", "Other"].includes(bhajan.language)) ||
      bhajan.language === language;
    return deityMatch && languageMatch;
  });
}

export function filterByMood(library: KirtanBhajan[], mood: KirtanMood): KirtanBhajan[] {
  return library.filter((bhajan) => bhajan.mood.includes(mood));
}

export function getOccasionSuggestions(library: KirtanBhajan[], date = new Date()): KirtanBhajan[] {
  const day = date.getDay();
  if (day === 1) return library.filter((bhajan) => bhajan.deity === "Shiva");
  if (day === 2 || day === 6) return library.filter((bhajan) => bhajan.deity === "Hanuman");
  if (day === 3) return library.filter((bhajan) => bhajan.deity === "Ganesh");
  if (day === 5) return library.filter((bhajan) => bhajan.deity === "Devi");
  return library.filter((bhajan) => bhajan.mood.includes("Morning Prayer") || bhajan.mood.includes("Aarti"));
}

export function createBhajanFromDraft(draft: Required<AddBhajanDraft>): KirtanBhajan {
  const safeId = normalize(draft.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id: `custom-${safeId}-${Date.now()}`,
    name: draft.name.trim(),
    aliases: [],
    keywords: [draft.name, draft.deity, draft.language].map((keyword) => keyword.trim().toLowerCase()),
    deity: draft.deity,
    language: draft.language,
    mood: ["Morning Prayer"],
    lyrics_preview: draft.lyrics_preview.trim(),
    youtube_link: draft.youtube_link.trim(),
    singer: draft.singer.trim() || "Unknown",
  };
}

export function loadSavedBhajans(): KirtanBhajan[] {
  try {
    const raw = window.localStorage.getItem(SAVED_BHAJANS_KEY);
    const parsed = raw ? JSON.parse(raw) as Array<Partial<KirtanBhajan> & BaseKirtanBhajan> : [];
    return parsed.map((bhajan) => ({
      ...bhajan,
      keywords: bhajan.keywords || [bhajan.name, bhajan.deity, bhajan.language].map((keyword) => keyword.trim().toLowerCase()),
    }));
  } catch {
    return [];
  }
}

export function saveBhajans(bhajansToSave: KirtanBhajan[]): void {
  window.localStorage.setItem(SAVED_BHAJANS_KEY, JSON.stringify(bhajansToSave));
}
