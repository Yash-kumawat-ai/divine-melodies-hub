import type { EventInput } from '@fullcalendar/core';

export type FestivalType = 'solar' | 'lunar' | 'gregorian';
export type FestivalImportance = 'major' | 'medium' | 'low';
export type FestivalRegion =
  | 'all'
  | 'rajasthan'
  | 'north'
  | 'west'
  | 'south'
  | 'east'
  | 'maharashtra'
  | 'gujarat'
  | 'bengal'
  | 'tamil-nadu'
  | 'karnataka';

export interface FestivalFasting {
  observed: boolean;
  type: string | null;
  rules_en: string;
  rules_hi: string;
}

export interface FestivalData {
  id: string;
  date: string;
  name_en: string;
  name_hi: string;
  name_sa: string;
  type: FestivalType;
  importance: FestivalImportance;
  regions: FestivalRegion[];
  regional_names: Record<string, string>;
  deity: string;
  description_en: string;
  description_hi: string;
  fasting: FestivalFasting;
  rituals: string[];
  color: string;
  tags: string[];
}

export interface FestivalDataset {
  year: number;
  source_note: string;
  festivals: FestivalData[];
  ekadashis_2026: FestivalData[];
}

const ekadashiBase = {
  type: 'lunar' as const,
  importance: 'medium' as const,
  regions: ['all'] as FestivalRegion[],
  deity: 'Vishnu',
  fasting: {
    observed: true,
    type: 'Ekadashi vrat',
    rules_en: 'Devotees usually fast from grains and beans, worship Lord Vishnu, chant, and break the fast on Dwadashi as per local parana time.',
    rules_hi: 'भक्त सामान्यतः अन्न और दाल से व्रत रखते हैं, भगवान विष्णु की पूजा करते हैं और स्थानीय पारण समय के अनुसार द्वादशी पर व्रत खोलते हैं।',
  },
  rituals: ['Vishnu puja', 'Tulsi offering', 'Mantra japa', 'Charity', 'Dwadashi parana'],
  color: '#d97706',
  tags: ['ekadashi', 'vrat', 'vishnu', 'fasting'],
};

const festivals: FestivalData[] = [
  {
    id: 'makar-sankranti-2026',
    date: '2026-01-14',
    name_en: 'Makar Sankranti',
    name_hi: 'मकर संक्रांति',
    name_sa: 'Makara Sankranti',
    type: 'solar',
    importance: 'major',
    regions: ['all', 'rajasthan', 'gujarat', 'maharashtra', 'south'],
    regional_names: {
      rajasthan: 'Sankranti',
      gujarat: 'Uttarayan',
      tamil_nadu: 'Pongal',
      assam: 'Magh Bihu',
    },
    deity: 'Surya',
    description_en: 'Solar transition into Makara rashi, observed with charity, sesame offerings, kites, and harvest thanksgiving.',
    description_hi: 'सूर्य के मकर राशि में प्रवेश का पर्व, जिसमें दान, तिल, पतंग और फसल के प्रति कृतज्ञता का भाव प्रमुख है।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Fasting is not universal; charity and sattvik food are common.',
      rules_hi: 'व्रत सर्वत्र अनिवार्य नहीं है; दान और सात्त्विक भोजन अधिक प्रचलित हैं।',
    },
    rituals: ['Surya arghya', 'Til-gud offering', 'Charity', 'Holy bath'],
    color: '#f59e0b',
    tags: ['sankranti', 'surya', 'harvest', 'solar'],
  },
  {
    id: 'maha-shivaratri-2026',
    date: '2026-02-15',
    name_en: 'Maha Shivaratri',
    name_hi: 'महाशिवरात्रि',
    name_sa: 'Maha Shivaratri',
    type: 'lunar',
    importance: 'major',
    regions: ['all'],
    regional_names: {},
    deity: 'Shiva',
    description_en: 'The great night of Lord Shiva, marked by night vigil, abhishek, mantra japa, and devotion.',
    description_hi: 'भगवान शिव की महान रात्रि, जिसमें रात्रि जागरण, अभिषेक, मंत्र जप और भक्ति की जाती है।',
    fasting: {
      observed: true,
      type: 'Shivaratri vrat',
      rules_en: 'Many devotees keep a day-long fast, avoid grains, worship Shiva through the night, and conclude after puja.',
      rules_hi: 'कई भक्त दिनभर व्रत रखते हैं, अन्न से परहेज करते हैं, रात्रि में शिव पूजा करते हैं और पूजा के बाद व्रत पूर्ण करते हैं।',
    },
    rituals: ['Shiva abhishek', 'Bilva offering', 'Om Namah Shivaya japa', 'Night vigil'],
    color: '#475569',
    tags: ['shiva', 'vrat', 'night-vigil', 'major'],
  },
  {
    id: 'holi-2026',
    date: '2026-03-04',
    name_en: 'Holi',
    name_hi: 'होली',
    name_sa: 'Holi',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan'],
    regional_names: {
      rajasthan: 'Dhulandi',
      north: 'Rangwali Holi',
    },
    deity: 'Krishna',
    description_en: 'Festival of colors celebrating devotion, spring, and the victory of dharma over arrogance.',
    description_hi: 'रंगों का पर्व, जो भक्ति, वसंत और अहंकार पर धर्म की विजय का उत्सव है।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Holika Dahan puja is observed the previous evening; fasting is regional and not universal.',
      rules_hi: 'पिछली शाम होलिका दहन पूजा होती है; व्रत क्षेत्रीय है और सर्वत्र अनिवार्य नहीं है।',
    },
    rituals: ['Holika Dahan', 'Krishna bhajans', 'Color play', 'Community greetings'],
    color: '#ec4899',
    tags: ['holi', 'krishna', 'spring', 'colors'],
  },
  {
    id: 'chaitra-navratri-2026',
    date: '2026-03-19',
    name_en: 'Chaitra Navratri Begins',
    name_hi: 'चैत्र नवरात्रि आरंभ',
    name_sa: 'Chaitra Navaratri',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan'],
    regional_names: {
      north: 'Vasant Navratri',
    },
    deity: 'Durga',
    description_en: 'Nine sacred days of Devi worship beginning in Chaitra month.',
    description_hi: 'चैत्र मास में आरंभ होने वाले देवी उपासना के नौ पवित्र दिन।',
    fasting: {
      observed: true,
      type: 'Navratri vrat',
      rules_en: 'Devotees may keep full or partial fasts, avoid grains, and perform daily Devi puja.',
      rules_hi: 'भक्त पूर्ण या आंशिक व्रत रखते हैं, अन्न से परहेज करते हैं और प्रतिदिन देवी पूजा करते हैं।',
    },
    rituals: ['Ghatasthapana', 'Durga puja', 'Aarti', 'Kanya pujan'],
    color: '#dc2626',
    tags: ['navratri', 'durga', 'fasting', 'devi'],
  },
  {
    id: 'ram-navami-2026',
    date: '2026-03-27',
    name_en: 'Ram Navami',
    name_hi: 'राम नवमी',
    name_sa: 'Rama Navami',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan'],
    regional_names: {},
    deity: 'Rama',
    description_en: 'Birth celebration of Lord Rama, observed with Ramayana recitation, bhajans, and temple worship.',
    description_hi: 'भगवान राम के जन्मोत्सव पर रामायण पाठ, भजन और मंदिर पूजा की जाती है।',
    fasting: {
      observed: true,
      type: 'Ram Navami vrat',
      rules_en: 'Many devotees fast until midday puja or keep a sattvik vrat according to family tradition.',
      rules_hi: 'कई भक्त मध्याह्न पूजा तक व्रत रखते हैं या पारिवारिक परंपरा के अनुसार सात्त्विक व्रत करते हैं।',
    },
    rituals: ['Ramayana path', 'Rama bhajan', 'Temple darshan', 'Aarti'],
    color: '#f97316',
    tags: ['rama', 'navami', 'bhajan', 'fasting'],
  },
  {
    id: 'hanuman-jayanti-2026',
    date: '2026-04-02',
    name_en: 'Hanuman Jayanti',
    name_hi: 'हनुमान जयंती',
    name_sa: 'Hanuman Jayanti',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan'],
    regional_names: {
      north: 'Hanuman Janmotsav',
    },
    deity: 'Hanuman',
    description_en: 'Celebration of Lord Hanuman with Chalisa, Sundarkand, and strength-centered devotion.',
    description_hi: 'हनुमान चालीसा, सुंदरकांड और बल-भक्ति के साथ भगवान हनुमान का उत्सव।',
    fasting: {
      observed: true,
      type: 'Hanuman vrat',
      rules_en: 'Some devotees observe a simple fast and offer sindoor, jasmine oil, and boondi or laddoo.',
      rules_hi: 'कुछ भक्त सरल व्रत रखते हैं और सिंदूर, चमेली तेल, बूंदी या लड्डू अर्पित करते हैं।',
    },
    rituals: ['Hanuman Chalisa', 'Sundarkand path', 'Sindoor offering', 'Aarti'],
    color: '#ea580c',
    tags: ['hanuman', 'chalisa', 'strength', 'fasting'],
  },
  {
    id: 'akshaya-tritiya-2026',
    date: '2026-04-19',
    name_en: 'Akshaya Tritiya',
    name_hi: 'अक्षय तृतीया',
    name_sa: 'Akshaya Tritiya',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'rajasthan', 'west'],
    regional_names: {
      rajasthan: 'Akha Teej',
    },
    deity: 'Vishnu',
    description_en: 'A highly auspicious day for charity, worship, new beginnings, and prosperity prayers.',
    description_hi: 'दान, पूजा, नए कार्य और समृद्धि की प्रार्थना के लिए अत्यंत शुभ दिन।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Fasting is optional; charity, Vishnu-Lakshmi worship, and sattvik conduct are emphasized.',
      rules_hi: 'व्रत वैकल्पिक है; दान, विष्णु-लक्ष्मी पूजा और सात्त्विक आचरण पर जोर दिया जाता है।',
    },
    rituals: ['Vishnu puja', 'Lakshmi puja', 'Charity', 'New beginnings'],
    color: '#eab308',
    tags: ['akshaya-tritiya', 'vishnu', 'lakshmi', 'auspicious'],
  },
  {
    id: 'buddha-purnima-2026',
    date: '2026-05-01',
    name_en: 'Buddha Purnima',
    name_hi: 'बुद्ध पूर्णिमा',
    name_sa: 'Buddha Purnima',
    type: 'lunar',
    importance: 'medium',
    regions: ['all'],
    regional_names: {
      east: 'Vesak',
    },
    deity: 'Buddha',
    description_en: 'Full moon observance associated with the birth, enlightenment, and teachings of Gautama Buddha.',
    description_hi: 'गौतम बुद्ध के जन्म, ज्ञान और शिक्षाओं से जुड़ा पूर्णिमा पर्व।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Devotees often practice meditation, charity, and vegetarian food; fasting is optional.',
      rules_hi: 'भक्त ध्यान, दान और शाकाहारी भोजन करते हैं; व्रत वैकल्पिक है।',
    },
    rituals: ['Meditation', 'Charity', 'Lamp offering', 'Dharma reading'],
    color: '#facc15',
    tags: ['purnima', 'buddha', 'meditation', 'charity'],
  },
  {
    id: 'apara-ekadashi-2026',
    date: '2026-05-13',
    name_en: 'Apara Ekadashi',
    name_hi: 'अपरा एकादशी',
    name_sa: 'Apara Ekadashi',
    regional_names: {},
    description_en: 'Ekadashi vrat in Jyeshtha Krishna Paksha dedicated to Lord Vishnu.',
    description_hi: 'ज्येष्ठ कृष्ण पक्ष की एकादशी, भगवान विष्णु को समर्पित व्रत।',
    ...ekadashiBase,
  },
  {
    id: 'vat-savitri-vrat-2026',
    date: '2026-05-16',
    name_en: 'Vat Savitri Vrat',
    name_hi: 'वट सावित्री व्रत',
    name_sa: 'Vat Savitri Vrata',
    type: 'lunar',
    importance: 'medium',
    regions: ['all', 'north', 'rajasthan', 'maharashtra'],
    regional_names: {},
    deity: 'Savitri',
    description_en: 'Vrat observed for marital wellbeing, inspired by Savitri and Satyavan.',
    description_hi: 'सावित्री और सत्यवान की कथा से प्रेरित, वैवाहिक मंगल के लिए किया जाने वाला व्रत।',
    fasting: {
      observed: true,
      type: 'Vat Savitri vrat',
      rules_en: 'Married women traditionally fast, worship the banyan tree, and listen to Savitri katha.',
      rules_hi: 'विवाहित महिलाएं व्रत रखती हैं, वट वृक्ष की पूजा करती हैं और सावित्री कथा सुनती हैं।',
    },
    rituals: ['Banyan tree puja', 'Thread circumambulation', 'Savitri katha', 'Offerings'],
    color: '#16a34a',
    tags: ['vat-savitri', 'fasting', 'married-women', 'vrat'],
  },
  {
    id: 'ganga-dussehra-2026',
    date: '2026-05-25',
    name_en: 'Ganga Dussehra',
    name_hi: 'गंगा दशहरा',
    name_sa: 'Ganga Dashahara',
    type: 'lunar',
    importance: 'medium',
    regions: ['all', 'north'],
    regional_names: {},
    deity: 'Ganga',
    description_en: 'Festival honoring the descent of Maa Ganga, marked by holy bath, prayer, and charity.',
    description_hi: 'मां गंगा के अवतरण का पर्व, जिसमें स्नान, प्रार्थना और दान का महत्व है।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Holy bath and charity are emphasized; fasting is optional and regional.',
      rules_hi: 'स्नान और दान प्रमुख हैं; व्रत वैकल्पिक और क्षेत्रीय है।',
    },
    rituals: ['Ganga snan', 'Deep daan', 'Charity', 'Ganga aarti'],
    color: '#0ea5e9',
    tags: ['ganga', 'dashami', 'charity', 'holy-bath'],
  },
  {
    id: 'padmini-ekadashi-2026',
    date: '2026-05-27',
    name_en: 'Padmini Ekadashi',
    name_hi: 'पद्मिनी एकादशी',
    name_sa: 'Padmini Ekadashi',
    regional_names: {
      all: 'Adhik Maas Shukla Ekadashi',
    },
    description_en: 'Adhik Maas Shukla Ekadashi vrat dedicated to Lord Vishnu.',
    description_hi: 'अधिक मास शुक्ल पक्ष की एकादशी, भगवान विष्णु को समर्पित व्रत।',
    ...ekadashiBase,
  },
  {
    id: 'nirjala-ekadashi-2026',
    date: '2026-06-26',
    name_en: 'Nirjala Ekadashi',
    name_hi: 'निर्जला एकादशी',
    name_sa: 'Nirjala Ekadashi',
    regional_names: {},
    description_en: 'A highly significant Ekadashi vrat traditionally observed without water by those able to do so.',
    description_hi: 'अत्यंत महत्वपूर्ण एकादशी व्रत, जिसे समर्थ भक्त परंपरागत रूप से निर्जल रखते हैं।',
    ...ekadashiBase,
  },
  {
    id: 'guru-purnima-2026',
    date: '2026-07-29',
    name_en: 'Guru Purnima',
    name_hi: 'गुरु पूर्णिमा',
    name_sa: 'Guru Purnima',
    type: 'lunar',
    importance: 'major',
    regions: ['all'],
    regional_names: {
      all: 'Vyasa Purnima',
    },
    deity: 'Vyasa',
    description_en: 'Day of reverence for gurus, teachers, and the lineage of spiritual knowledge.',
    description_hi: 'गुरु, शिक्षक और आध्यात्मिक ज्ञान परंपरा के प्रति कृतज्ञता का दिन।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Guru puja, study, and charity are common; fasting is optional.',
      rules_hi: 'गुरु पूजा, अध्ययन और दान प्रचलित हैं; व्रत वैकल्पिक है।',
    },
    rituals: ['Guru puja', 'Vyasa puja', 'Scripture study', 'Dakshina'],
    color: '#8b5cf6',
    tags: ['guru', 'purnima', 'vyasa', 'gratitude'],
  },
  {
    id: 'raksha-bandhan-2026',
    date: '2026-08-28',
    name_en: 'Raksha Bandhan',
    name_hi: 'रक्षा बंधन',
    name_sa: 'Raksha Bandhana',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan'],
    regional_names: {
      maharashtra: 'Narali Purnima',
    },
    deity: 'Vishnu',
    description_en: 'Festival of protection and sibling bonds, observed with rakhi, blessings, and family worship.',
    description_hi: 'रक्षा और भाई-बहन के स्नेह का पर्व, जिसमें राखी, आशीर्वाद और पारिवारिक पूजा होती है।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Fasting is not universal; family puja and rakhi ceremony are central.',
      rules_hi: 'व्रत सर्वत्र नहीं है; पारिवारिक पूजा और राखी अनुष्ठान प्रमुख हैं।',
    },
    rituals: ['Rakhi tying', 'Tilak', 'Aarti', 'Family blessings'],
    color: '#db2777',
    tags: ['raksha-bandhan', 'family', 'purnima', 'rakhi'],
  },
  {
    id: 'janmashtami-2026',
    date: '2026-09-04',
    name_en: 'Krishna Janmashtami',
    name_hi: 'कृष्ण जन्माष्टमी',
    name_sa: 'Krishna Janmashtami',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan', 'west'],
    regional_names: {
      south: 'Krishna Jayanthi',
    },
    deity: 'Krishna',
    description_en: 'Birth celebration of Lord Krishna, observed with midnight worship, bhajans, and fasting.',
    description_hi: 'भगवान कृष्ण का जन्मोत्सव, जिसमें मध्यरात्रि पूजा, भजन और व्रत किया जाता है।',
    fasting: {
      observed: true,
      type: 'Janmashtami vrat',
      rules_en: 'Devotees often fast until midnight Krishna Janma puja and then take prasad.',
      rules_hi: 'भक्त प्रायः मध्यरात्रि कृष्ण जन्म पूजा तक व्रत रखते हैं और फिर प्रसाद ग्रहण करते हैं।',
    },
    rituals: ['Midnight puja', 'Krishna bhajan', 'Jhulan', 'Bhagavad Gita reading'],
    color: '#2563eb',
    tags: ['krishna', 'janmashtami', 'fasting', 'bhajan'],
  },
  {
    id: 'ganesh-chaturthi-2026',
    date: '2026-09-14',
    name_en: 'Ganesh Chaturthi',
    name_hi: 'गणेश चतुर्थी',
    name_sa: 'Ganesha Chaturthi',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'maharashtra', 'west', 'south'],
    regional_names: {
      maharashtra: 'Ganeshotsav',
    },
    deity: 'Ganesha',
    description_en: 'Celebration of Lord Ganesha with sthapana, modak, aarti, and community devotion.',
    description_hi: 'भगवान गणेश का उत्सव, जिसमें स्थापना, मोदक, आरती और सामूहिक भक्ति होती है।',
    fasting: {
      observed: true,
      type: 'Ganesh Chaturthi vrat',
      rules_en: 'Some devotees fast until Ganesha puja and offer modak or sattvik prasad.',
      rules_hi: 'कुछ भक्त गणेश पूजा तक व्रत रखते हैं और मोदक या सात्त्विक प्रसाद अर्पित करते हैं।',
    },
    rituals: ['Ganesha sthapana', 'Modak offering', 'Aarti', 'Visarjan'],
    color: '#f59e0b',
    tags: ['ganesha', 'chaturthi', 'maharashtra', 'modak'],
  },
  {
    id: 'sharad-navratri-2026',
    date: '2026-10-11',
    name_en: 'Sharad Navratri Begins',
    name_hi: 'शारदीय नवरात्रि आरंभ',
    name_sa: 'Sharad Navaratri',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan', 'gujarat', 'bengal'],
    regional_names: {
      gujarat: 'Garba Navratri',
      bengal: 'Durga Puja season',
    },
    deity: 'Durga',
    description_en: 'Autumn Navratri dedicated to Devi, observed with fasting, garba, Durga puja, and daily worship.',
    description_hi: 'देवी को समर्पित शारदीय नवरात्रि, जिसमें व्रत, गरबा, दुर्गा पूजा और दैनिक उपासना होती है।',
    fasting: {
      observed: true,
      type: 'Navratri vrat',
      rules_en: 'Devotees may keep nine-day or selected-day fasts and perform daily Devi worship.',
      rules_hi: 'भक्त नौ दिन या चुने हुए दिनों का व्रत रखते हैं और प्रतिदिन देवी पूजा करते हैं।',
    },
    rituals: ['Ghatasthapana', 'Durga puja', 'Garba', 'Kanya pujan'],
    color: '#dc2626',
    tags: ['navratri', 'durga', 'garba', 'fasting'],
  },
  {
    id: 'dussehra-2026',
    date: '2026-10-20',
    name_en: 'Dussehra',
    name_hi: 'दशहरा',
    name_sa: 'Vijaya Dashami',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan', 'south', 'bengal'],
    regional_names: {
      all: 'Vijaya Dashami',
      bengal: 'Durga Visarjan',
    },
    deity: 'Rama',
    description_en: 'Celebrates the victory of dharma, associated with Lord Rama and Devi Durga.',
    description_hi: 'धर्म की विजय का पर्व, जो भगवान राम और देवी दुर्गा से जुड़ा है।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Fasting depends on Navratri tradition; Dussehra itself centers on puja and victory observances.',
      rules_hi: 'व्रत नवरात्रि परंपरा पर निर्भर है; दशहरा मुख्यतः पूजा और विजय उत्सव का दिन है।',
    },
    rituals: ['Ayudha puja', 'Ravana dahan', 'Durga visarjan', 'Shami puja'],
    color: '#b45309',
    tags: ['dussehra', 'vijaya-dashami', 'rama', 'durga'],
  },
  {
    id: 'karwa-chauth-2026',
    date: '2026-10-29',
    name_en: 'Karwa Chauth',
    name_hi: 'करवा चौथ',
    name_sa: 'Karaka Chaturthi',
    type: 'lunar',
    importance: 'medium',
    regions: ['north', 'rajasthan', 'all'],
    regional_names: {
      rajasthan: 'Karwa Chauth',
    },
    deity: 'Shiva-Parvati',
    description_en: 'Married women traditionally observe a strict fast for marital wellbeing and moonrise worship.',
    description_hi: 'विवाहित महिलाएं वैवाहिक मंगल के लिए कठोर व्रत रखती हैं और चंद्रोदय पर पूजा करती हैं।',
    fasting: {
      observed: true,
      type: 'Nirjala vrat',
      rules_en: 'Traditionally observed from sunrise to moonrise without food or water, according to family custom.',
      rules_hi: 'परंपरा अनुसार सूर्योदय से चंद्रोदय तक अन्न-जल त्याग कर व्रत रखा जाता है।',
    },
    rituals: ['Sargi', 'Karwa puja', 'Moonrise arghya', 'Family blessings'],
    color: '#be123c',
    tags: ['karwa-chauth', 'fasting', 'rajasthan', 'married-women'],
  },
  {
    id: 'diwali-2026',
    date: '2026-11-08',
    name_en: 'Diwali',
    name_hi: 'दीपावली',
    name_sa: 'Deepavali',
    type: 'lunar',
    importance: 'major',
    regions: ['all', 'north', 'rajasthan', 'west', 'south'],
    regional_names: {
      all: 'Deepavali',
      north: 'Diwali',
    },
    deity: 'Lakshmi',
    description_en: 'Festival of lights centered on Lakshmi puja, lamps, family worship, and renewal.',
    description_hi: 'दीपों का पर्व, जिसमें लक्ष्मी पूजा, दीपदान, पारिवारिक पूजा और नव आरंभ का भाव होता है।',
    fasting: {
      observed: false,
      type: null,
      rules_en: 'Some families keep a light fast before Lakshmi puja; fasting is not universal.',
      rules_hi: 'कुछ परिवार लक्ष्मी पूजा से पहले हल्का व्रत रखते हैं; व्रत सर्वत्र अनिवार्य नहीं है।',
    },
    rituals: ['Lakshmi puja', 'Deep daan', 'Ganesha puja', 'Family aarti'],
    color: '#f59e0b',
    tags: ['diwali', 'lakshmi', 'lights', 'major'],
  },
];

export const festivalDataset: FestivalDataset = {
  year: 2026,
  source_note:
    '2026 festival dates are maintained as a static data layer for India/IST. Panchang-driven dates can vary by region and local sunrise rules.',
  festivals,
  ekadashis_2026: festivals.filter((festival) => festival.tags.includes('ekadashi')),
};

const eventClassByImportance: Record<FestivalImportance, string> = {
  major: 'festival-utsav',
  medium: 'festival-parva',
  low: 'festival-vrat',
};

export function getTodayFestivals(date = todayInIndia(), region?: FestivalRegion): FestivalData[] {
  return filterByRegion(festivalDataset.festivals.filter((festival) => festival.date === date), region);
}

export function getMonthFestivals(month: string, region?: FestivalRegion): FestivalData[] {
  return filterByRegion(festivalDataset.festivals.filter((festival) => festival.date.startsWith(month)), region);
}

export function getFastingDays(region?: FestivalRegion): FestivalData[] {
  return filterByRegion(festivalDataset.festivals.filter((festival) => festival.fasting.observed), region);
}

export function getFestivalsByRegion(region: FestivalRegion): FestivalData[] {
  return filterByRegion(festivalDataset.festivals, region);
}

export function getNextEkadashi(date = todayInIndia()): FestivalData | undefined {
  return festivalDataset.ekadashis_2026.find((ekadashi) => ekadashi.date >= date);
}

export function getFestivalCalendarEvents(language: 'en' | 'hi', region?: FestivalRegion): EventInput[] {
  return filterByRegion(festivalDataset.festivals, region).map((festival) => ({
    id: festival.id,
    title: language === 'hi' ? festival.name_hi : festival.name_en,
    date: festival.date,
    className: eventClassByImportance[festival.importance],
    backgroundColor: festival.color,
    borderColor: festival.color,
    extendedProps: {
      festival,
    },
  }));
}

function filterByRegion(festivalsToFilter: FestivalData[], region?: FestivalRegion): FestivalData[] {
  if (!region) return festivalsToFilter;
  return festivalsToFilter.filter((festival) => festival.regions.includes('all') || festival.regions.includes(region));
}

function todayInIndia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
