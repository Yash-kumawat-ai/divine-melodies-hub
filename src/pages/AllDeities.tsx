import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDeities } from "@/hooks/useDeities";
import { getDeityUrl, resolveDeityBySlug } from "@/lib/deityUrls";
import { useLanguage } from "@/hooks/useLanguage";
import { useBhajanCounts } from "@/hooks/useBhajanCounts";
import { SEO } from "@/components/SEO";
import { deities as presetDeities } from "@/data/bhajans";
import { LotusIcon } from "@/components/icons/LotusIcon";
import SearchBar from "@/components/SearchBar";

// Floral & Sacred motifs
import mandalaGold from "@/pages/images/mandala-gold.svg";
import ramYellowFlower from "@/pages/images/svg/ram yellow flower.svg";
import radhePinkFlower from "@/pages/images/svg/radhe pink flower.svg";
import shivayyWhiteFlower from "@/pages/images/svg/shivayy white flower.svg";
import shyamBlueFlower from "@/pages/images/svg/shyam blue flower.svg";
import diyaSvg from "@/pages/images/svg/diya.svg";

export default function AllDeities() {
  const navigate = useNavigate();
  const { deities: allDeities, loading } = useDeities();
  const { getDeityCount } = useBhajanCounts();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [searchQuery, setSearchQuery] = useState("");

  const getDeitySlug = (deity: typeof allDeities[number]) => {
    if (deity.isCustom) {
      return deity.name.toLowerCase().replace(/\s+/g, '-');
    }
    return presetDeities.find(d => d.id === deity.id)?.slug || deity.name.toLowerCase();
  };

  const getDeityFloralSvg = (slug: string) => {
    switch (slug) {
      case 'rama': return ramYellowFlower;
      case 'krishna': return radhePinkFlower;
      case 'shiva': return shivayyWhiteFlower;
      case 'khatu-shyam': return shyamBlueFlower;
      default: return null;
    }
  };

  // In-memory instant filtering
  const filteredDeities = useMemo(() => {
    if (!searchQuery.trim()) return allDeities;
    const q = searchQuery.toLowerCase().trim();
    return allDeities.filter(d => {
      const profile = resolveDeityBySlug(d.slug || d.id || d.name);
      return (
        d.name.toLowerCase().includes(q) || 
        (d.nameHindi && d.nameHindi.includes(q)) ||
        (profile?.nameHindi && profile.nameHindi.includes(q)) ||
        (profile?.titleHindi && profile.titleHindi.includes(q)) ||
        (profile?.aliases && profile.aliases.some(a => a.toLowerCase().includes(q))) ||
        (d.description && d.description.toLowerCase().includes(q))
      );
    });
  }, [allDeities, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-background pb-20 text-[#3A2418] dark:text-[#FFFDF8]">
      <SEO
        title={isHi ? "समस्त आराध्य देव संग्रह | Raghavam" : "All Sacred Deities & Profiles | Raghavam"}
        description="सनातन धर्म के प्रमुख आराध्य देव: भगवान श्री कृष्ण, शिव, राम, हनुमान, माँ दुर्गा, खाटू श्याम, श्री गणेश, माँ लक्ष्मी दर्शन एवं भजन।"
      />

      {/* Royal Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-[#FFFDF8] to-[#FFFDF8] dark:from-amber-950/20 dark:via-[#1A120B] dark:to-background border-b border-[#E8D8C4]/60 dark:border-[#D4A437]/20 pt-5 pb-7 px-4 sm:px-6">
        <img 
          src={mandalaGold} 
          className="absolute -right-12 -top-12 w-48 h-48 opacity-[0.05] pointer-events-none object-contain" 
          alt="" 
        />
        
        <div className="container mx-auto max-w-6xl">
          {/* Back Button & Top Sacred Motif Badge */}
          <div className="flex items-center gap-2.5 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-[#651317]/5 text-[#651317] dark:text-[#E8B15C] transition-colors cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-[#651317]/8 to-amber-500/15 border border-[#D4A437]/40 shadow-xs">
              <img src={diyaSvg} alt="" className="w-3.5 h-3.5 object-contain" />
              <span className="text-[11px] font-bold font-serif text-[#651317] dark:text-[#E8B15C] uppercase tracking-wider">
                {isHi ? "सनातन देव लोक • समस्त आराध्य देव" : "Sacred Divine Realm • All Sacred Deities"}
              </span>
              <LotusIcon className="w-3.5 h-3.5 text-[#651317] dark:text-[#D4A437]" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#3A2418] dark:text-[#FFFDF8] leading-tight">
                {isHi ? "समस्त आराध्य देव संग्रह" : "All Sacred Deities & Portals"}
              </h1>
              <p className="text-xs sm:text-sm text-[#786252] dark:text-stone-400 mt-1 font-medium max-w-xl">
                {isHi 
                  ? "अपने इष्ट देव के चरणों में वंदन करें और उनके पावन भजन, आरतियाँ, चालीसा व मंत्रों का आनंद लें।"
                  : "Explore sacred profiles, divine bhajans, aartis, chalisas, and mantras dedicated to each deity."}
              </p>
            </div>

            {/* Standard SearchBar Component with Royal Home Styling */}
            <div className="w-full md:w-96 shrink-0">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder={isHi ? "समस्त देवों में खोजें (उदा. कृष्ण, शिव, राम)..." : "Search deities (e.g. Krishna, Shiva, Ram)..."}
                enableAutocomplete={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#651317] dark:text-[#E8B15C]" />
          </div>
        ) : filteredDeities.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFDF8] dark:bg-[#1A120B] border border-dashed border-[#E8D8C4] dark:border-zinc-800 rounded-3xl p-8 max-w-md mx-auto">
            <span className="text-3xl mb-2 block">🪷</span>
            <h3 className="font-serif text-base font-bold text-[#3A2418] dark:text-foreground mb-1">
              {isHi ? "कोई देव स्वरूप नहीं मिला" : "No deities matched your search"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {isHi ? "कृपया अन्य नाम से खोजें।" : "Try typing another name."}
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-1.5 rounded-full bg-[#651317] text-white text-xs font-bold cursor-pointer"
            >
              {isHi ? "सभी देव देखें" : "View All"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDeities.map((deity) => {
              const slug = getDeitySlug(deity);
              const floralSvg = getDeityFloralSvg(slug);
              const count = getDeityCount(deity.id || 0);
              const profile = resolveDeityBySlug(deity.slug || deity.id || deity.name);

              const deityDisplayName = isHi
                ? (profile?.nameHindi || deity.nameHindi || deity.name)
                : deity.name;

              const deitySubtitle = isHi
                ? (profile?.titleHindi || deity.nameHindi || "पावन देव स्वरूप")
                : (profile?.description || deity.description || "Sacred deity profile");

              return (
                <div
                  key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                  onClick={() => navigate(getDeityUrl(deity))}
                  className="group rounded-[24px] bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4]/80 dark:border-[#D4A437]/25 p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(95,72,38,0.05)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden select-none text-center"
                >
                  <div>
                    {/* Portrait with Gold Ring Halo */}
                    <div className="w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] mx-auto rounded-full p-[3px] bg-gradient-to-b from-[#D4A437] via-[#651317] to-[#D4A437] shadow-md overflow-hidden relative mb-3">
                      <div className="w-full h-full rounded-full bg-[#FFFDF8] dark:bg-[#1A120B] flex items-center justify-center overflow-hidden">
                        {deity.imageUrl ? (
                          <img
                            src={deity.imageUrl}
                            alt={deity.name}
                            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-4xl select-none">{deity.emoji}</span>
                        )}
                      </div>

                      {floralSvg && (
                        <img 
                          src={floralSvg} 
                          alt="" 
                          className="absolute -bottom-1 -right-1 w-6 h-6 drop-shadow-sm pointer-events-none opacity-90 transition-transform group-hover:rotate-12" 
                        />
                      )}
                    </div>

                    {/* Titles in Hindi */}
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#3A2418] dark:text-[#FFFDF8] group-hover:text-[#651317] dark:group-hover:text-[#D4A437] transition-colors leading-snug">
                      {deityDisplayName}
                    </h3>
                    
                    {/* Hindi Devotional Subtitle */}
                    <p className="text-[11.5px] sm:text-xs text-[#786252] dark:text-stone-400 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                      {deitySubtitle}
                    </p>
                  </div>

                  {/* Footer Action & Count Badge */}
                  <div className="mt-4 pt-3 border-t border-[#E8D8C4]/60 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#651317]/8 dark:bg-[#D4A437]/15 text-[#651317] dark:text-[#E8B15C] text-[10.5px] sm:text-xs font-bold">
                      {count > 0 ? `${count} भजन` : "भजन संग्रह"}
                    </span>

                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#651317] dark:text-[#E8B15C] group-hover:translate-x-1 transition-transform">
                      <span>{isHi ? "दर्शन" : "Explore"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
