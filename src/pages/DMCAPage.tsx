import { ArrowLeft, ShieldAlert, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SEO } from '@/components/SEO';

export default function DMCAPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-[#070302] text-[#3A2418] dark:text-amber-50 p-4 md:p-8 pb-24">
      <SEO
        title={isHi ? 'डीएमसीए कॉपीराइट सूचना | Raghavam' : 'DMCA Copyright Notice | Raghavam'}
        description="Copyright compliance and DMCA designated agent contact information for Raghavam."
      />

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-[#E8D8C4] dark:border-white/10 hover:bg-[#FFF9F2] dark:hover:bg-white/10 transition-colors text-xs font-bold tracking-wide text-[#651317] dark:text-amber-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isHi ? 'पीछे जाएं' : 'Go Back'}</span>
          </button>
        </div>

        {/* Card Panel */}
        <div className="p-6 md:p-10 border border-[#EAD7C3] dark:border-orange-900/20 bg-white/90 dark:bg-[#2a1a08]/30 rounded-3xl space-y-6 shadow-[0_12px_32px_rgba(74,14,18,0.06)] dark:shadow-xl">
          <div className="flex items-center gap-3 text-[#651317] dark:text-orange-400">
            <ShieldAlert className="w-8 h-8" />
            <h1 className="font-serif font-black text-2xl md:text-3xl text-[#3A2418] dark:text-amber-50">
              {isHi ? 'डीएमसीए कॉपीराइट नीति' : 'DMCA Copyright Policy'}
            </h1>
          </div>

          <div className="space-y-4 text-sm text-[#5C4332] dark:text-stone-300 leading-relaxed font-medium">
            <p>
              {isHi 
                ? 'राघवम् (Raghavam) दूसरों के बौद्धिक संपदा अधिकारों का सम्मान करता है। डिजिटल मिलेनियम कॉपीराइट एक्ट (DMCA) के अनुसार, हम कॉपीराइट उल्लंघन के दावों का त्वरित जवाब देने के लिए प्रतिबद्ध हैं।' 
                : 'Raghavam respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act (DMCA), we are committed to responding promptly to claims of copyright infringement.'}
            </p>

            <div className="border-l-4 border-[#D8A35A]/70 dark:border-orange-500/40 pl-4 py-1 my-6 italic text-[#6B5344] dark:text-stone-400 bg-[#FFF9F2]/80 dark:bg-transparent rounded-r-lg">
              <p className="font-bold text-xs tracking-wide text-[#651317] dark:text-orange-400 mb-1 not-italic">
                {isHi ? 'महत्वपूर्ण सूचना:' : 'Important Notice:'}
              </p>
              <p>
                {isHi
                  ? 'राघवम् अपने सर्वर पर कोई भी वीडियो फ़ाइलें अपलोड, स्टोर या पुनर्वितरित नहीं करता है। सभी वीडियो सामग्री यूट्यूब के आधिकारिक प्लेयर के माध्यम से सीधे एम्बेड (embedded) की जाती है और वे पूरी तरह से यूट्यूब के सर्वर पर ही होस्ट की गई हैं।'
                  : 'Raghavam does not upload, store, or redistribute any video files on its servers. All video assets are embedded directly from YouTube using the official player and remain hosted entirely on YouTube\'s servers.'}
              </p>
            </div>

            <h2 className="font-serif text-lg font-bold text-[#3A2418] dark:text-stone-200 pt-2">
              {isHi ? 'कॉपीराइट उल्लंघन की सूचना (Claims)' : 'Infringement Notification Claims'}
            </h2>
            <p>
              {isHi
                ? 'यदि आप एक कॉपीराइट स्वामी हैं और आपको लगता है कि राघवम् पर उपलब्ध कोई भी एम्बेडेड वीडियो आपके कॉपीराइट का उल्लंघन करता है, तो हम दृढ़ता से अनुशंसा करते हैं कि आप पहले यूट्यूब (YouTube) को एक सीधे निष्कासन अनुरोध (take down request) भेजें। चूंकि वीडियो यूट्यूब पर होस्ट किया गया है, यूट्यूब से इसे हटाने पर यह हमारे ऐप से भी स्वचालित रूप से हट जाएगा।'
                : 'If you are a copyright owner and believe that any embedded video available on Raghavam infringes upon your copyright, we strongly recommend that you first submit a takedown notice directly to YouTube. Since the video is hosted on YouTube, removing it from YouTube will automatically disable it inside our application.'}
            </p>

            <p>
              {isHi
                ? 'वैकल्पिक रूप से, आप नीचे दिए गए विवरणों के साथ हमारे नामित एजेंट से संपर्क करके राघवम् से उस विशिष्ट एम्बेडेड लिंक को हटाने का अनुरोध कर सकते हैं:'
                : 'Alternatively, you may contact our Designated Agent to request the removal of the specific embedded link from Raghavam, providing the following information:'}
            </p>

            <ul className="list-disc pl-5 space-y-2 text-[#5C4332] dark:text-stone-300">
              <li>
                {isHi 
                  ? 'कथित रूप से उल्लंघन किए गए कार्य का सटीक विवरण।' 
                  : 'A description of the copyrighted work that you claim has been infringed.'}
              </li>
              <li>
                {isHi 
                  ? 'राघवम् ऐप पर उस लिंक का यूआरएल या स्थान जहाँ उल्लंघनकारी सामग्री मौजूद है।' 
                  : 'The location (URL or video ID) of the infringing material on Raghavam.'}
              </li>
              <li>
                {isHi 
                  ? 'आपका संपर्क विवरण: ईमेल, पता और टेलीफोन नंबर।' 
                  : 'Your contact details, including your email address, mailing address, and telephone number.'}
              </li>
              <li>
                {isHi 
                  ? 'एक बयान कि आपको सद्भावना विश्वास (good faith belief) है कि सामग्री का उपयोग कॉपीराइट स्वामी द्वारा अधिकृत नहीं है।' 
                  : 'A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner.'}
              </li>
              <li>
                {isHi 
                  ? 'झूठी गवाही के दंड के तहत एक बयान कि आपकी सूचना में दी गई जानकारी सटीक है।' 
                  : 'A statement made under penalty of perjury that the information in your notice is accurate.'}
              </li>
            </ul>

            <h2 className="font-serif text-lg font-bold text-[#3A2418] dark:text-stone-200 pt-4">
              {isHi ? 'नामित एजेंट संपर्क' : 'Designated Copyright Agent'}
            </h2>
            
            <div className="flex items-center gap-3 p-4 bg-[#FFF9F2] dark:bg-[#1b0e06] border border-[#EAD7C3] dark:border-orange-500/10 rounded-2xl max-w-sm">
              <Mail className="w-6 h-6 text-[#651317] dark:text-orange-400" />
              <div>
                <p className="font-bold text-xs tracking-wide text-[#651317] dark:text-orange-400">Email Address</p>
                <a href="mailto:copyright@raghavam.com" className="text-sm font-semibold text-[#3A2418] dark:text-white hover:text-[#651317] dark:hover:text-orange-400 transition-colors">
                  copyright@raghavam.com
                </a>
              </div>
            </div>

            <p className="text-xs text-[#8C6D53] dark:text-stone-500 pt-4">
              {isHi
                ? 'अंतिम अद्यतन: जुलाई 2026'
                : 'Last Updated: July 2026'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
