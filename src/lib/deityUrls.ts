import deityKrishna from '@/assets/deities/krishna.webp';
import deityShiva from '@/assets/deities/shiva.webp';
import deityHanuman from '@/assets/deities/hanuman.webp';
import deityRama from '@/assets/deities/rama.webp';
import deityDurga from '@/assets/deities/durga.webp';
import deityGanesh from '@/assets/deities/ganesh.webp';
import deitySaiBaba from '@/assets/deities/sai-baba.webp';
import deityLakshmi from '@/assets/deities/lakshmi.webp';

export interface DeityProfile {
  id: number;
  slug: string;
  aliases: string[];
  name: string;
  nameHindi: string;
  titleHindi: string;
  description: string;
  aboutHindi: string;
  aboutEnglish: string;
  emoji: string;
  colorClass: string;
  imageUrl?: string;
  mantra?: string;
  mantraSlug?: string;
  relatedDeitySlugs: string[];
  sacredAbodes?: string[];
  keyFestivals?: string[];
}

export const DEITY_PROFILES: DeityProfile[] = [
  {
    id: 1,
    slug: 'krishna',
    aliases: ['krishna', 'kanha', 'gopal', 'govind', 'shyam', 'kisan', 'krsna', 'krishan', 'कृष्ण', 'कान्हा', 'गोपाल', 'गोविंद', 'मुरलीधर', 'माधव'],
    name: 'Krishna',
    nameHindi: 'भगवान श्री कृष्ण',
    titleHindi: 'पूर्ण पुरुषोत्तम • माखनचोर व गीता उपदेशक',
    description: 'Lord of compassion, tenderness, divine love, and cosmic wisdom.',
    aboutHindi: 'भगवान श्री कृष्ण सनातन धर्म के प्रमुख देव और भगवान विष्णु के आठवें पूर्ण अवतार हैं। उन्होंने द्वापर युग में धर्म की स्थापना, कंस वध और कुरुक्षेत्र में श्रीमद्भगवद्गीता का अमर ज्ञान दिया। श्री कृष्ण की बाल लीलाएं, रासलीला और मुरली की मधुर धुन भक्तों को मुग्ध करती है।',
    aboutEnglish: 'Lord Krishna is the eighth incarnation of Lord Vishnu, revered as the supreme embodiment of divine love, wisdom, and cosmic joy. He delivered the eternal wisdom of the Bhagavad Gita on the battlefield of Kurukshetra.',
    emoji: '🪈',
    colorClass: 'bg-blue-500',
    imageUrl: deityKrishna,
    mantra: 'हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे। हरे राम हरे राम, राम राम हरे हरे॥',
    mantraSlug: 'hare-krishna-mahamantra',
    relatedDeitySlugs: ['rama', 'durga', 'ganesh', 'khatu-shyam'],
    sacredAbodes: ['वृंदावन', 'मथुरा', 'द्वारका', 'गोकुल'],
    keyFestivals: ['श्री कृष्ण जन्माष्टमी', 'राधाष्टमी', 'होली', 'गोवर्धन पूजा']
  },
  {
    id: 2,
    slug: 'shiva',
    aliases: ['shiva', 'shiv', 'mahadev', 'bhole', 'bholenath', 'shankar', 'rudra', 'neelkanth', 'shivji', 'shivaji', 'शिव', 'महादेव', 'भोलेनाथ', 'शंकर', 'रुद्र', 'नीलकंठ', 'शिवजी'],
    name: 'Shiva',
    nameHindi: 'भगवान शिव',
    titleHindi: 'देवाधिदेव महादेव • संहारकर्ता व कल्याणकारी',
    description: 'The auspicious transformer, yogi of yogis, and lord of cosmic consciousness.',
    aboutHindi: 'भगवान शिव देवों के देव महादेव हैं, जो त्रिमूर्ति में संहार और पुनर्जन्म के स्वामी हैं। वे त्याग, वैराग्य, करुणा और ध्यान की पराकाष्ठा हैं। विषपान कर नीलकंठ कहलाने वाले शिव अपने भक्तों पर तुरंत प्रसन्न होकर मनवांछित वरदान देते हैं, इसलिए उन्हें भोलेनाथ भी कहा जाता है।',
    aboutEnglish: 'Lord Shiva is Mahadeva, the supreme deity of transformation, meditation, and cosmic bliss. Revered as Bholenath for his compassionate nature, he is the fountainhead of yoga, dance, and spiritual liberation.',
    emoji: '🔱',
    colorClass: 'bg-orange-600',
    imageUrl: deityShiva,
    mantra: 'ॐ नमः शिवाय',
    mantraSlug: 'om-namah-shivaya',
    relatedDeitySlugs: ['durga', 'ganesh', 'hanuman', 'rama'],
    sacredAbodes: ['कैलाश पर्वत', 'काशी विश्वनाथ', 'केदारनाथ', 'सोमनाथ', 'महाकालेश्वर'],
    keyFestivals: ['महाशिवरात्रि', 'सावन सोमवार', 'प्रदोष व्रत']
  },
  {
    id: 3,
    slug: 'hanuman',
    aliases: ['hanuman', 'bajrangbali', 'maruti', 'sankatmochan', 'balaji', 'anjaneya', 'pavanputra', 'hanumana', 'हनुमान', 'बजरंगबली', 'मारुति', 'संकटमोचन', 'बालाजी', 'पवनपुत्र', 'अंजनीपुत्र'],
    name: 'Hanuman',
    nameHindi: 'श्री हनुमान जी',
    titleHindi: 'संकटमोचन • अतुलित बलशाली व परम रामभक्त',
    description: 'Symbol of supreme devotion, boundless courage, strength, and humility.',
    aboutHindi: 'श्री हनुमान जी भगवान शिव के ग्यारहवें रुद्रावतार और प्रभु श्री राम के अनन्य भक्त हैं। वे ज्ञान, गुण और बल के सागर हैं। उनका स्मरण करने मात्र से भूत-पिशाच, भय और जीवन के समस्त संकट दूर हो जाते हैं। उनकी चालीसा और सुंदरकांड का पाठ घर-घर में कल्याण करता है।',
    aboutEnglish: 'Lord Hanuman is the embodiment of unmatched strength, unwavering loyalty, and selfless devotion to Lord Rama. He is the dispeller of all fears and obstacles.',
    emoji: '🙏',
    colorClass: 'bg-orange-500',
    imageUrl: deityHanuman,
    mantra: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्',
    mantraSlug: 'om-chanting',
    relatedDeitySlugs: ['rama', 'shiva', 'ganesh'],
    sacredAbodes: ['सालासर बालाजी', 'मेहंदीपुर बालाजी', 'हनुमान गढ़ी (अयोध्या)', 'संकट मोचन (वाराणसी)'],
    keyFestivals: ['हनुमान जयंती', 'मंगलवार व शनिवार व्रत']
  },
  {
    id: 4,
    slug: 'rama',
    aliases: ['rama', 'ram', 'raghunath', 'siyaram', 'ramchandra', 'ramji', 'shri-ram', 'shrirama', 'राम', 'रघुनाथ', 'सियाराम', 'रामचंद्र', 'श्रीराम', 'प्रभु राम'],
    name: 'Rama',
    nameHindi: 'मर्यादा पुरुषोत्तम श्री राम',
    titleHindi: 'मर्यादा पुरुषोत्तम • अयोध्या नरेश व धर्मरक्षक',
    description: 'The embodiment of righteousness, truth, virtue, and ideal leadership.',
    aboutHindi: 'प्रभु श्री राम भगवान विष्णु के सातवें अवतार हैं, जिन्होंने अपने आदर्श जीवन, सत्य, मर्यादा और त्याग से संपूर्ण मानव जाति को धर्म का मार्ग दिखाया। रावण का वध कर उन्होंने अधर्म पर धर्म की विजय स्थापित की। राम नाम का जप समस्त पापों का नाश करने वाला महामंत्र है।',
    aboutEnglish: 'Lord Rama is the ideal incarnation of virtue, honor, and righteous conduct (Maryada Purushottama). His victory over Ravana symbolizes the triumph of divine truth over evil.',
    emoji: '🏹',
    colorClass: 'bg-green-600',
    imageUrl: deityRama,
    mantra: 'श्री राम जय राम जय जय राम',
    mantraSlug: 'jai-shree-ram',
    relatedDeitySlugs: ['hanuman', 'krishna', 'shiva'],
    sacredAbodes: ['श्री राम जन्मभूमि (अयोध्या)', 'चित्रकूट', 'रामेश्वरम', 'जनकपुर'],
    keyFestivals: ['श्री राम नवमी', 'दीपावली (अयोध्या आगमन)', 'विजयादशमी']
  },
  {
    id: 5,
    slug: 'durga',
    aliases: ['durga', 'ambe', 'sherawali', 'mata', 'parvati', 'kali', 'bhavani', 'jagadamba', 'maadurga', 'दुर्गा', 'अम्बे', 'शेरावाली', 'माता', 'पार्वती', 'काली', 'भवानी', 'जगदम्बा', 'माँ दुर्गा'],
    name: 'Durga',
    nameHindi: 'माँ भगवती दुर्गा',
    titleHindi: 'आदिशक्ति • दुर्गतिनाशिनी व शक्ति स्वरूपा',
    description: 'Supreme mother goddess representing cosmic power, protection, and grace.',
    aboutHindi: 'माँ दुर्गा आदि पराशक्ति हैं, जो समस्त ब्रह्मांड की उत्पत्ति, पालन और संहार की अधिष्ठात्री देवी हैं। उन्होंने महिषासुर, शुंभ-निशुंभ जैसे असुरों का संहार कर धर्म और संतों की रक्षा की। नवरात्रि में माँ के नौ रूपों की उपासना से भक्तों को शक्ति, धन, आरोग्य और मोक्ष की प्राप्ति होती है।',
    aboutEnglish: 'Maa Durga is the supreme Divine Mother and embodiment of Shakti (cosmic energy). She vanquishes negative forces and blesses her devotees with protection, fearlessness, and prosperity.',
    emoji: '🌺',
    colorClass: 'bg-red-600',
    imageUrl: deityDurga,
    mantra: 'ॐ दुं दुर्गायै नमः',
    mantraSlug: 'om-chanting',
    relatedDeitySlugs: ['shiva', 'ganesh', 'lakshmi'],
    sacredAbodes: ['वैष्णो देवी', 'कामाख्या देवी', 'ज्वाला जी', 'कालीघाट'],
    keyFestivals: ['शारदीय नवरात्रि', 'चैत्र नवरात्रि', 'दुर्गा पूजा']
  },
  {
    id: 6,
    slug: 'ganesh',
    aliases: ['ganesh', 'ganesha', 'ganpati', 'vinayak', 'gajanand', 'ekdant', 'lambodar', 'ganeshji', 'गणेश', 'गणपति', 'विनायक', 'गजानन', 'एकदंत', 'लंबोदर', 'गणेशजी'],
    name: 'Ganesh',
    nameHindi: 'भगवान श्री गणेश',
    titleHindi: 'प्रथम पूज्य • विघ्नहर्ता व बुद्धि-सिद्धि दाता',
    description: 'The remover of all obstacles, master of intellect, and lord of new beginnings.',
    aboutHindi: 'भगवान श्री गणेश समस्त देवी-देवताओं में प्रथम पूज्य हैं। भगवान शिव और माता पार्वती के पुत्र गणेश जी बुद्धि, विवेक, समृद्धि और शुभता के प्रदाता हैं। किसी भी शुभ कार्य या पूजन का आरंभ उनके ध्यान और वंदन से ही किया जाता है।',
    aboutEnglish: 'Lord Ganesha is the beloved remover of obstacles (Vighnaharta) and patron of wisdom, learning, and new beginnings. He is traditionally worshipped first before initiating any auspicious endeavor.',
    emoji: '🐘',
    colorClass: 'bg-yellow-500',
    imageUrl: deityGanesh,
    mantra: 'ॐ गं गणपतये नमः',
    mantraSlug: 'shri-ganesha-mantra',
    relatedDeitySlugs: ['shiva', 'durga', 'lakshmi', 'hanuman'],
    sacredAbodes: ['अष्टविनायक (महाराष्ट्र)', 'सिद्धिविनायक (मुंबई)', 'रणथंभौर गणेश', 'मोती डूंगरी (जयपुर)'],
    keyFestivals: ['गणेश चतुर्थी', 'संकष्टी चतुर्थी']
  },
  {
    id: 7,
    slug: 'sai-baba',
    aliases: ['sai-baba', 'saibaba', 'sai', 'shirdi-sai', 'shirdisaibaba', 'साईं', 'साईं बाबा', 'साई', 'शिरडी साईं'],
    name: 'Sai Baba',
    nameHindi: 'शिरडी साईं बाबा',
    titleHindi: 'सबका मालिक एक • श्रद्धा और सबूरी के पथप्रदर्शक',
    description: 'Beloved spiritual master preaching universal love, faith, and patience.',
    aboutHindi: 'शिरडी के साईं बाबा महान संत और सद्गुरु हैं जिन्होंने "सबका मालिक एक" और "श्रद्धा व सबूरी" का दिव्य संदेश दिया। वे हर पीड़ित, निर्धन और भक्त की पुकार सुनते हैं। उनके द्वार पर जाति, धर्म और संप्रदाय का कोई भेद नहीं है।',
    aboutEnglish: 'Shirdi Sai Baba is an enlightened spiritual master revered across faiths for his timeless message of Shraddha (faith), Saburi (patience), and selfless service to humanity.',
    emoji: '✨',
    colorClass: 'bg-amber-400',
    imageUrl: deitySaiBaba,
    mantra: 'ॐ साईं राम',
    mantraSlug: 'om-chanting',
    relatedDeitySlugs: ['krishna', 'shiva', 'hanuman', 'rama'],
    sacredAbodes: ['शिरडी साईं समाधि मंदिर (महाराष्ट्र)'],
    keyFestivals: ['गुरु पूर्णिमा', 'रामनवमी', 'विजयादशमी']
  },
  {
    id: 8,
    slug: 'lakshmi',
    aliases: ['lakshmi', 'laxmi', 'mahalakshmi', 'shri', 'padmavati', 'लक्ष्मी', 'महालक्ष्मी', 'माँ लक्ष्मी', 'कमला'],
    name: 'Lakshmi',
    nameHindi: 'माँ महालक्ष्मी',
    titleHindi: 'धन-वैभव दात्री • क्षीरसागर कन्या व विष्णुप्रिया',
    description: 'Goddess of wealth, fortune, auspiciousness, and spiritual abundance.',
    aboutHindi: 'माँ लक्ष्मी भगवान विष्णु की अर्धांगिनी और धन, ऐश्वर्य, सौभाग्य और समृद्धि की देवी हैं। क्षीरसागर मंथन से प्रकट हुई माँ लक्ष्मी कमल पुष्प पर विराजमान रहती हैं। उनकी कृपा से घर-परिवार में सुख, शांति और वैभव का वास होता है।',
    aboutEnglish: 'Goddess Lakshmi is the divine consort of Lord Vishnu and the bestower of wealth, prosperity, auspiciousness, and spiritual grace.',
    emoji: '🪷',
    colorClass: 'bg-pink-500',
    imageUrl: deityLakshmi,
    mantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः',
    mantraSlug: 'om-chanting',
    relatedDeitySlugs: ['ganesh', 'durga', 'krishna', 'rama'],
    sacredAbodes: ['महालक्ष्मी मंदिर (कोल्हापुर)', 'महालक्ष्मी मंदिर (मुंबई)', 'पद्मावती मंदिर (तिरुपति)'],
    keyFestivals: ['दीपावली (लक्ष्मी पूजन)', 'वरलक्ष्मी व्रत', 'शरद पूर्णिमा']
  },
  {
    id: 9,
    slug: 'khatu-shyam',
    aliases: ['khatu-shyam', 'khatushyam', 'shyam-baba', 'barbarik', 'haare-ka-sahara', 'खाटू श्याम', 'श्याम बाबा', 'खाटू', 'बर्बरीक', 'हारे का सहारा', 'लखदातार'],
    name: 'Khatu Shyam',
    nameHindi: 'हारे का सहारा खाटू श्याम जी',
    titleHindi: 'शीश के दानी • कलयुग के प्रत्यक्ष देव व लखदातार',
    description: 'The compassionate form of Barbarika revered as Shyam Baba, protector of the helpless.',
    aboutHindi: 'खाटू श्याम जी महाभारत कालीन वीर बर्बरीक हैं, जिन्होंने भगवान श्री कृष्ण के मांगने पर अपना शीश दान कर दिया था। प्रसन्न होकर श्री कृष्ण ने उन्हें कलयुग में अपने नाम "श्याम" से पूजे जाने और "हारे का सहारा" बनने का वरदान दिया। खाटू धाम में उनके दर्शन से सभी दुख दूर होते हैं।',
    aboutEnglish: 'Khatu Shyam Ji is the divine incarnation of warrior Barbarika, blessed by Lord Krishna to be worshipped in Kaliyuga as the ultimate refuge of the distressed and faithful.',
    emoji: '🏇',
    colorClass: 'bg-rose-500',
    imageUrl: deityKrishna,
    mantra: 'ॐ श्री श्याम देवाय नमः',
    mantraSlug: 'om-chanting',
    relatedDeitySlugs: ['krishna', 'hanuman', 'rama'],
    sacredAbodes: ['खाटू धाम (सीकर, राजस्थान)', 'रिंगस'],
    keyFestivals: ['खाटू लक्खी मेला (फाल्गुन एकादशी)', 'द्वादशी उत्सव', 'कार्तिक एकादशी']
  }
];

/**
 * Normalizes any text query, alias, or slug into a clean lookup key
 */
function normalizeLookupKey(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9\u0900-\u097F\-]/g, '');
}

/**
 * Resolves a deity by slug, name, or alias (case-insensitive, handles English + Hindi)
 */
export function resolveDeityBySlug(
  slugOrQuery: string | number | undefined | null,
  customDeities?: Array<{ id?: number; name: string; nameHindi?: string; emoji?: string; imageUrl?: string; slug?: string }>
): DeityProfile | undefined {
  if (slugOrQuery === undefined || slugOrQuery === null || slugOrQuery === '') return undefined;

  // 1. If numeric ID passed
  if (typeof slugOrQuery === 'number' || /^\d+$/.test(String(slugOrQuery).trim())) {
    const numId = Number(slugOrQuery);
    const byId = DEITY_PROFILES.find(d => d.id === numId);
    if (byId) return byId;

    if (customDeities) {
      const custom = customDeities.find(d => d.id === numId);
      if (custom) return mapCustomToProfile(custom);
    }
    return undefined;
  }

  const raw = String(slugOrQuery).trim();
  const lookup = normalizeLookupKey(raw);

  // 2. Direct exact slug match
  const directSlug = DEITY_PROFILES.find(d => d.slug === lookup || d.slug.toLowerCase() === raw.toLowerCase());
  if (directSlug) return directSlug;

  // 3. Alias match in preset deities
  for (const deity of DEITY_PROFILES) {
    if (deity.aliases.some(a => normalizeLookupKey(a) === lookup || a.toLowerCase() === raw.toLowerCase())) {
      return deity;
    }
    if (deity.name.toLowerCase() === raw.toLowerCase() || (deity.nameHindi && deity.nameHindi === raw)) {
      return deity;
    }
  }

  // 4. Custom deities check
  if (customDeities && customDeities.length > 0) {
    for (const custom of customDeities) {
      const customSlug = custom.slug || custom.name.toLowerCase().replace(/\s+/g, '-');
      if (
        customSlug === lookup ||
        custom.name.toLowerCase() === raw.toLowerCase() ||
        (custom.nameHindi && custom.nameHindi === raw)
      ) {
        return mapCustomToProfile(custom);
      }
    }
  }

  return undefined;
}

function mapCustomToProfile(custom: { id?: number; name: string; nameHindi?: string; emoji?: string; imageUrl?: string; slug?: string; description?: string }): DeityProfile {
  const slug = custom.slug || custom.name.toLowerCase().trim().replace(/\s+/g, '-');
  return {
    id: custom.id || 999,
    slug,
    aliases: [slug, custom.name.toLowerCase()],
    name: custom.name,
    nameHindi: custom.nameHindi || custom.name,
    titleHindi: `${custom.nameHindi || custom.name} • पावन देव स्वरूप`,
    description: custom.description || `Devotional profile of ${custom.name}.`,
    aboutHindi: `${custom.nameHindi || custom.name} सनातन धर्म में पूजनीय देव स्वरूप हैं। उनके चरणों में श्रद्धा और भक्ति से समस्त मनोरथ सिद्ध होते हैं।`,
    aboutEnglish: `Devotional homage and complete sacred collection dedicated to ${custom.name}.`,
    emoji: custom.emoji || '🙏',
    colorClass: 'bg-amber-600',
    imageUrl: custom.imageUrl,
    relatedDeitySlugs: ['krishna', 'shiva', 'hanuman', 'rama'],
  };
}

/**
 * Generates the canonical URL for a deity profile
 */
export function getDeityUrl(deity: { slug?: string; name?: string; id?: number } | null | undefined): string {
  if (!deity) return '/all-deities';
  if (deity.slug) return `/deity/${deity.slug}`;
  const resolved = resolveDeityBySlug(deity.id || deity.name);
  if (resolved) return `/deity/${resolved.slug}`;
  if (deity.name) {
    return `/deity/${deity.name.toLowerCase().trim().replace(/\s+/g, '-')}`;
  }
  return '/all-deities';
}

/**
 * Returns the canonical slug string for any deity input
 */
export function getCanonicalDeitySlug(slugOrName: string): string {
  const resolved = resolveDeityBySlug(slugOrName);
  return resolved ? resolved.slug : slugOrName.toLowerCase().trim().replace(/\s+/g, '-');
}
