import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deities, bhajans, Bhajan as StaticBhajan } from '@/data/bhajans';
import { Loader2, User, CheckCircle2, AlertTriangle, Video, FileText, ExternalLink, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { CHALISA_SUB_TYPES, OTHER_SUB_TYPES } from '@/constants/uploadCategories';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { getContentUrl } from '@/lib/contentUrls';

interface BhajanFormProps {
  lyrics: string;
  imageUrl?: string;
  onSuccess?: () => void;
  onBack?: () => void;
  deityId?: number | null;
  deityName?: string;
  categoryName?: string;
  categoryHindi?: string;
  categoryEmoji?: string;
  categoryId?: string;
}

interface MatchResult {
  title: string;
  titleHindi?: string;
  url: string;
  singer?: string;
  category?: string;
  similarity: number;
}

// Calculate title similarity score (0.0 to 1.0)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim().replace(/[^a-z0-9\u0900-\u097F]/gi, '');
  const s2 = str2.toLowerCase().trim().replace(/[^a-z0-9\u0900-\u097F]/gi, '');
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const words1 = s1.split(/\s+/).filter(w => w.length > 2);
  const words2 = s2.split(/\s+/).filter(w => w.length > 2);
  if (words1.length === 0 || words2.length === 0) return 0;

  const common = words1.filter((w) => words2.includes(w));
  const total = new Set([...words1, ...words2]).size;

  return total > 0 ? common.length / total : 0;
}

export default function BhajanForm({
  lyrics,
  imageUrl,
  onSuccess,
  onBack,
  deityId: initialDeityId,
  deityName: initialDeityName,
  categoryName = 'Bhajan',
  categoryHindi = 'भजन',
  categoryEmoji = '🎵',
  categoryId = 'bhajan',
}: BhajanFormProps) {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const normalizedContentType = (categoryId || 'bhajan').toLowerCase().replace('custom_', '');
  const isBhajan = normalizedContentType === 'bhajan';
  const isAarti = normalizedContentType === 'aarti';
  const isChalisa = normalizedContentType === 'chalisa';
  const isKatha = normalizedContentType === 'katha';
  const isOther = normalizedContentType === 'other' || normalizedContentType.includes('custom');

  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [subType, setSubType] = useState('');
  const [deityId, setDeityId] = useState<string>(initialDeityId != null ? String(initialDeityId) : '');
  const [deityName, setDeityName] = useState(initialDeityName || '');
  const [singerName, setSingerName] = useState('');
  const [composerName, setComposerName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [extractingMetadata, setExtractingMetadata] = useState(false);
  const [showFullLyricsPreview, setShowFullLyricsPreview] = useState(false);

  // Duplicate detection state
  const [potentialDuplicate, setPotentialDuplicate] = useState<MatchResult | null>(null);
  const [ignoredDuplicateWarning, setIgnoredDuplicateWarning] = useState(false);

  const getFieldConfig = () => {
    if (isAarti) {
      return {
        formTitle: isHi ? 'आरती का विवरण' : 'Aarti Details',
        singerLabel: isHi ? 'प्रस्तुतकर्ता (गायक/गायिका) *' : 'Performer Name *',
        singerSub: isHi ? 'यह आरती कौन प्रस्तुत कर रहे हैं?' : 'Who is performing this Aarti?',
        singerRequired: true,
        composerLabel: isHi ? 'स्रोत / रचनाकार' : 'Source / Composer',
        composerSub: isHi ? 'यह आरती का स्रोत या रचनाकार (वैकल्पिक)' : 'Source or composer (Optional)',
        composerPlaceholder: isHi ? 'उदा: पारंपरिक' : 'e.g. Traditional',
        submitBtn: isHi ? 'आरती सबमिट करें' : 'Submit Aarti',
        successTitle: isHi ? 'आरती सफलतापूर्वक सबमिट हो गई!' : 'Aarti Submitted Successfully!',
      };
    }
    if (isChalisa) {
      return {
        formTitle: isHi ? 'चालीसा / पाठ विवरण' : 'Chalisa & Path Details',
        singerLabel: isHi ? 'पाठकर्ता / गायक' : 'Reciter Name',
        singerSub: isHi ? 'यह पाठ कौन कर रहे हैं? (वैकल्पिक)' : 'Who is reciting? (Optional)',
        singerRequired: false,
        composerLabel: isHi ? 'स्रोत' : 'Source',
        composerSub: isHi ? 'पाठ का पारंपरिक स्रोत (वैकल्पिक)' : 'Traditional source (Optional)',
        composerPlaceholder: isHi ? 'पारंपरिक' : 'Traditional',
        submitBtn: isHi ? 'चालीसा सबमिट करें' : 'Submit Chalisa',
        successTitle: isHi ? 'चालीसा सफलतापूर्वक सबमिट हो गया!' : 'Chalisa Submitted Successfully!',
      };
    }
    if (isKatha) {
      return {
        formTitle: isHi ? 'कथा / प्रसंग विवरण' : 'Katha Details',
        singerLabel: isHi ? 'कथावाचक / प्रवचनकर्ता *' : 'Narrator / Speaker Name *',
        singerSub: isHi ? 'यह कथा कौन सुना रहे हैं?' : 'Who is narrating this katha?',
        singerRequired: true,
        composerLabel: isHi ? 'स्रोत ग्रंथ' : 'Source Scripture',
        composerSub: isHi ? 'किस ग्रंथ से है? (वैकल्पिक)' : 'Which scripture? (Optional)',
        composerPlaceholder: isHi ? 'वाल्मीकि रामायण / भागवत पुराण' : 'Valmiki Ramayana / Shrimad Bhagvat',
        submitBtn: isHi ? 'कथा सबमिट करें' : 'Submit Katha',
        successTitle: isHi ? 'कथा सफलतापूर्वक सबमिट हो गई!' : 'Katha Submitted Successfully!',
      };
    }
    if (isOther) {
      return {
        formTitle: isHi ? 'अन्य दिव्य रचना विवरण' : 'Other Content Details',
        singerLabel: isHi ? 'प्रस्तुतकर्ता' : 'Performer Name',
        singerSub: isHi ? 'इसे कौन गा/प्रस्तुत कर रहे हैं? (वैकल्पिक)' : 'Who is performing? (Optional)',
        singerRequired: false,
        composerLabel: isHi ? 'रचनाकार / स्रोत' : 'Author / Source',
        composerSub: isHi ? 'रचनाकार का नाम (वैकल्पिक)' : 'Author name (Optional)',
        composerPlaceholder: isHi ? 'उदा: गोस्वामी तुलसीदास' : 'e.g. Tulsidas',
        submitBtn: isHi ? 'रचना सबमिट करें' : 'Submit Entry',
        successTitle: isHi ? 'रचना सफलतापूर्वक सबमिट हो गई!' : 'Submitted Successfully!',
      };
    }

    return {
      formTitle: isHi ? 'भजन विवरण' : 'Bhajan Details',
      singerLabel: isHi ? 'गायक/प्रस्तुतकर्ता *' : 'Singer / Artist Name *',
      singerSub: isHi ? 'यह भजन कौन गा रहे हैं?' : 'Who is singing this bhajan?',
      singerRequired: true,
      composerLabel: isHi ? 'रचनाकार/स्रोत' : 'Composer / Lyricist',
      composerSub: isHi ? 'यह भजन किसने लिखा है? (वैकल्पिक)' : 'Who wrote this? (Optional)',
      composerPlaceholder: isHi ? 'उदा: जगजीत सिंह / पारंपरिक' : 'e.g. Traditional',
      submitBtn: isHi ? 'भजन सबमिट करें' : 'Submit Bhajan',
      successTitle: isHi ? 'भजन सफलतापूर्वक सबमिट हो गया!' : 'Bhajan Submitted Successfully!',
    };
  };

  const fieldConfig = getFieldConfig();

  useEffect(() => {
    if (initialDeityId !== undefined) {
      setDeityId(initialDeityId != null ? String(initialDeityId) : '');
    }
  }, [initialDeityId]);

  useEffect(() => {
    if (initialDeityName) {
      setDeityName(initialDeityName);
      return;
    }
    const d = deities.find((x) => String(x.id) === deityId);
    if (d) setDeityName(d.name);
  }, [deityId, initialDeityName]);

  // Real-time Duplicate Check against static bhajans and user_uploads
  useEffect(() => {
    const inputT = title.trim();
    const inputTH = titleHindi.trim();

    if (!inputT && !inputTH) {
      setPotentialDuplicate(null);
      setIgnoredDuplicateWarning(false);
      return;
    }

    // Check static bhajans list
    for (const item of bhajans) {
      const simEn = calculateSimilarity(inputT, item.title);
      const simHi = calculateSimilarity(inputTH, item.titleHindi);

      if (simEn > 0.65 || simHi > 0.65) {
        setPotentialDuplicate({
          title: item.title,
          titleHindi: item.titleHindi,
          url: getContentUrl(item),
          singer: item.singerName,
          category: item.contentType || 'bhajan',
          similarity: Math.max(simEn, simHi),
        });
        return;
      }
    }

    // Also check Supabase existing uploads if input is long enough
    const checkSupabaseDuplicates = async () => {
      try {
        const queryTerm = inputTH || inputT;
        if (queryTerm.length < 3) return;

        const { data } = await supabase
          .from('user_uploads')
          .select('*')
          .or(`title.ilike.%${queryTerm}%,title_hindi.ilike.%${queryTerm}%`)
          .limit(3);

        if (data && data.length > 0) {
          const match = data[0];
          setPotentialDuplicate({
            title: match.title,
            titleHindi: match.title_hindi,
            url: getContentUrl({ slug: match.slug, contentType: match.content_type, subType: match.sub_type }),
            singer: match.singer_name,
            category: match.content_type,
            similarity: 0.8,
          });
          return;
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
      setPotentialDuplicate(null);
    };

    const timer = setTimeout(checkSupabaseDuplicates, 300);
    return () => clearTimeout(timer);
  }, [title, titleHindi]);

  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return;

    setExtractingMetadata(true);
    try {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        setExtractingMetadata(false);
        return;
      }
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        if (!title && data.title) setTitle(data.title);
      }
    } catch (err) {
      console.log('YouTube metadata fetch error:', err);
    } finally {
      setExtractingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(isHi ? 'कृपया पहले लॉग इन करें' : 'You must be logged in');
      return;
    }

    if (!titleHindi.trim()) {
      setError(isHi ? 'कृपया हिंदी शीर्षक दर्ज करें' : 'Please provide Hindi title');
      return;
    }

    if ((isChalisa || isOther) && !subType) {
      setError(isHi ? 'कृपया उप-श्रेणी (Sub-type) चुनें' : 'Please select sub-type');
      return;
    }

    if (fieldConfig.singerRequired && !singerName.trim()) {
      setError(isHi ? 'कृपया प्रस्तुतकर्ता/गायक का नाम दर्ज करें' : 'Please provide artist/singer name');
      return;
    }

    if (!isKatha && !deityId) {
      setError(isHi ? 'कृपया भगवान/देवी का चयन करें' : 'Please select a deity');
      return;
    }

    // Require user to check duplicate or click 'Proceed anyway'
    if (potentialDuplicate && !ignoredDuplicateWarning) {
      setError(
        isHi
          ? `संभावित समान रचना मिली: '${potentialDuplicate.titleHindi || potentialDuplicate.title}'! कृपया इसे देखें या 'अलग संस्करण है' पर क्लिक करें।`
          : `Potential duplicate found: '${potentialDuplicate.title}'! Please check existing content or click 'Different Version' to proceed.`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dbContentType = isAarti ? 'aarti' : isChalisa ? 'chalisa' : isKatha ? 'katha' : isOther ? 'other' : 'bhajan';

      const insertPayload: Record<string, any> = {
        user_id: user.id,
        content_type: dbContentType,
        sub_type: subType || null,
        title: title.trim() || titleHindi.trim(),
        title_hindi: titleHindi.trim(),
        slug: generateBhajanSlug(title.trim() || titleHindi.trim()),
        deity_id: deityId ? parseInt(deityId) : null,
        singer_name: singerName.trim() || null,
        composer_name: composerName.trim() || null,
        lyrics_hindi: lyrics.trim(),
        image_url: imageUrl || '',
        youtube_url: youtubeUrl.trim() || '',
        status: 'pending',
      };

      if (potentialDuplicate) {
        insertPayload.admin_notes = `[DUPLICATE_CHECK] Matched: ${potentialDuplicate.titleHindi || potentialDuplicate.title} | User Claimed Different: ${ignoredDuplicateWarning}`;
      }

      const { error: insertError } = await supabase
        .from('user_uploads')
        .insert([insertPayload]);

      if (insertError) throw new Error(insertError.message || 'Submission failed');

      setSuccess(true);
      setTimeout(() => onSuccess?.(), 2000);
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1E1710] rounded-2xl p-6 sm:p-8 border-2 border-[#E8D8C4] dark:border-zinc-800 shadow-md text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8] mb-2">
          {fieldConfig.successTitle}
        </h3>
        <p className="text-sm text-[#7A6B60] dark:text-[#D4C5B9] mb-6 max-w-md mx-auto leading-relaxed">
          {isHi 
            ? 'आपकी रचना एडमिन समीक्षा के लिए भेज दी गई है। स्वीकृत होते ही यह ऐप पर दिखेगी।' 
            : 'Your content has been submitted for admin review.'}
        </p>
        <Button onClick={() => onSuccess?.()} className="rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold px-6 py-2.5">
          ← {isHi ? 'होम पर लौटें' : 'Back to Home'}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1E1710] rounded-2xl p-6 sm:p-8 border-2 border-[#E8D8C4] dark:border-zinc-800 shadow-md space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#EFE4D7] dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryEmoji}</span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8]">
            {fieldConfig.formTitle}
          </h3>
        </div>
        {profile && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/50 rounded-xl text-xs font-bold text-[#6A2C2A] dark:text-[#E8B15C]">
            <User className="w-3.5 h-3.5" />
            <span>{profile.name}</span>
          </div>
        )}
      </div>

      {/* Step 3 Lyrics & Media Preview Card */}
      {(lyrics || imageUrl) && (
        <div className="bg-[#FAF2E8]/70 dark:bg-amber-950/20 border border-[#EFE4D7] dark:border-amber-900/40 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6A2C2A] dark:text-[#E8B15C] flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{isHi ? "आपके द्वारा पिछले चरण (Step 3) में जोड़े गए बोल व मीडिया:" : "Lyrics & media added in Step 3:"}</span>
            </span>
            {lyrics && (
              <button
                type="button"
                onClick={() => setShowFullLyricsPreview(!showFullLyricsPreview)}
                className="text-xs text-[#7A2D28] dark:text-[#E8B15C] font-bold hover:underline flex items-center gap-1"
              >
                <span>{showFullLyricsPreview ? (isHi ? 'कम दिखाएं' : 'Show less') : (isHi ? 'पूरी रचना देखें' : 'View full')}</span>
                {showFullLyricsPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {lyrics && (
            <div className="text-xs text-[#32251E] dark:text-[#FFFDF8] font-sans bg-white/90 dark:bg-[#1E1710]/90 p-3 rounded-xl border border-[#EFE4D7] dark:border-zinc-800 leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto">
              {showFullLyricsPreview ? lyrics : lyrics.slice(0, 200) + (lyrics.length > 200 ? '...' : '')}
            </div>
          )}

          {imageUrl && (
            <div className="flex items-center gap-3 pt-1">
              <img src={imageUrl} alt="Lyrics Image" className="w-14 h-14 object-cover rounded-xl border border-[#EFE4D7]" />
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7A2D28] dark:text-[#E8B15C] font-bold underline flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isHi ? "अपलोड की गई फोटो देखें" : "View uploaded image"}</span>
              </a>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Sub-type Dropdown (Shown for Chalisa & Other) */}
      {(isChalisa || isOther) && (
        <div>
          <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
            {isHi ? "उप-श्रेणी (Sub-type) *" : "Sub-type *"}
          </label>
          <select
            value={subType}
            onChange={(e) => setSubType(e.target.value)}
            required
            className="w-full rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium px-3 focus:outline-none focus:border-[#7A2D28] shadow-sm"
          >
            <option value="">{isHi ? "-- उप-श्रेणी चुनें --" : "-- Select Sub-type --"}</option>
            {(isChalisa ? CHALISA_SUB_TYPES : OTHER_SUB_TYPES).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelHindi} ({opt.value})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Titles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
            {isHi ? "शीर्षक (हिंदी देवनागरी में) *" : "Title (Hindi Only) *"}
          </label>
          <Input
            value={titleHindi}
            onChange={(e) => setTitleHindi(e.target.value)}
            placeholder="शीर्षक हिंदी में (उदा: हरे कृष्ण)"
            required
            className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
            {isHi ? "शीर्षक (अंग्रेजी में - optional)" : "Title (English Optional)"}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title in English (e.g. Hare Krishna)"
            className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium"
          />
        </div>
      </div>

      {/* Interactive Duplicate Alert Warning Card */}
      {potentialDuplicate && !ignoredDuplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3 shadow-sm animate-in fade-in-50">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                {isHi ? "संभावित समान रचना पहले से मौजूद है" : "Potential Duplicate Found"}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                {isHi
                  ? `'${potentialDuplicate.titleHindi || potentialDuplicate.title}' नाम की रचना वेबसाइट पर पहले से उपलब्ध है।`
                  : `'${potentialDuplicate.title}' is already available on the website.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="btn-sm btn-primary"
              onClick={() => {
                const searchUrl = potentialDuplicate.url || `/search?q=${encodeURIComponent(potentialDuplicate.titleHindi || potentialDuplicate.title)}`;
                window.open(searchUrl, '_blank');
              }}
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              <span>{isHi ? "मौजूदा रचना देखें" : "View Existing Content"}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="btn-sm btn-secondary"
              onClick={() => setIgnoredDuplicateWarning(true)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-400" />
              <span>{isHi ? "अलग संस्करण / गायक है (आगे बढ़ें)" : "Different Version / Singer (Proceed)"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Singer & Composer Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
            {fieldConfig.singerLabel}
          </label>
          <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] mb-1 font-medium">{fieldConfig.singerSub}</p>
          <Input
            value={singerName}
            onChange={(e) => setSingerName(e.target.value)}
            placeholder={isHi ? "उदा: अनुराधा पौडवाल / वाचक" : "e.g. Artist Name"}
            required={fieldConfig.singerRequired}
            className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
            {fieldConfig.composerLabel}
          </label>
          <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] mb-1 font-medium">{fieldConfig.composerSub}</p>
          <Input
            value={composerName}
            onChange={(e) => setComposerName(e.target.value)}
            placeholder={fieldConfig.composerPlaceholder}
            className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium"
          />
        </div>
      </div>

      {/* YouTube URL */}
      <div className={isKatha ? "p-4 rounded-xl border-2 border-[#7A2D28]/40 dark:border-[#E8B15C]/40 bg-[#FAF2E8]/40 dark:bg-amber-950/20" : ""}>
        <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1 flex items-center gap-1.5">
          {isKatha && <Video className="w-4 h-4 text-[#7A2D28] dark:text-[#E8B15C]" />}
          <span>{isHi ? "यूट्यूब वीडियो/ऑдио लिंक" : "YouTube Video/Audio Link"} {isKatha ? "(कथा हेतु मुख्य फ़ील्ड)" : "(Optional)"}</span>
        </label>
        <Input
          type="url"
          value={youtubeUrl}
          onChange={(e) => handleYouTubeUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-11 text-sm font-medium"
        />
        {extractingMetadata && (
          <p className="text-xs text-[#7A6B60] mt-1 flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {isHi ? "यूट्यूब डेटा एक्सट्रैक्ट हो रहा है..." : "Extracting video metadata..."}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4 border-t border-[#EFE4D7] dark:border-zinc-800">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="rounded-xl border-[#EFE4D7] font-bold px-5 h-11">
            {isHi ? 'पीछे' : 'Back'}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold h-11 shadow-md hover:opacity-95"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {fieldConfig.submitBtn}
        </Button>
      </div>
    </form>
  );
}
