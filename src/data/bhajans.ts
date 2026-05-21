import { smartSearchBhajans } from '@/lib/searchAlgorithm';

import deityKrishna from '@/assets/deities/krishna.png';
import deityShiva from '@/assets/deities/shiva.png';
import deityHanuman from '@/assets/deities/hanuman.png';
import deityRama from '@/assets/deities/rama.png';
import deityDurga from '@/assets/deities/durga.png';
import deityGanesh from '@/assets/deities/ganesh.png';
import deitySaiBaba from '@/assets/deities/sai-baba.png';
import deityLakshmi from '@/assets/deities/lakshmi.png';

export interface Deity {
  id: number;
  slug: string;
  name: string;
  nameHindi: string;
  description: string;
  emoji: string;
  colorClass: string;
  bhajanCount: number;
  imageUrl?: string;
}

export interface Bhajan {
  id: number;
  slug: string;
  title: string;
  titleHindi: string;
  deityId: number;
  lyricsHindi: string;
  lyricsTransliteration: string;
  imageUrl?: string;
  singerName: string;
  composerName?: string;
  playCount: number;
  rating: number;
  tags: string[];
  featured: boolean;
  videoEmbedId?: string;
  youtubeUrl?: string;
}

export const deities: Deity[] = [
  { id: 1, slug: 'krishna', name: 'Krishna', nameHindi: 'कृष्ण', description: 'Lord of compassion, tenderness, and love', emoji: '🪈', colorClass: 'bg-blue-500', bhajanCount: 45, imageUrl: deityKrishna },
  { id: 2, slug: 'shiva', name: 'Shiva', nameHindi: 'शिव', description: 'The transformer and destroyer', emoji: '🔱', colorClass: 'bg-orange-600', bhajanCount: 38, imageUrl: deityShiva },
  { id: 3, slug: 'hanuman', name: 'Hanuman', nameHindi: 'हनुमान', description: 'Symbol of strength and devotion', emoji: '🙏', colorClass: 'bg-orange-500', bhajanCount: 32, imageUrl: deityHanuman },
  { id: 4, slug: 'rama', name: 'Rama', nameHindi: 'राम', description: 'Ideal man and righteous king', emoji: '🏹', colorClass: 'bg-green-600', bhajanCount: 40, imageUrl: deityRama },
  { id: 5, slug: 'durga', name: 'Durga', nameHindi: 'दुर्गा', description: 'Goddess of protection and strength', emoji: '🌺', colorClass: 'bg-red-600', bhajanCount: 28, imageUrl: deityDurga },
  { id: 6, slug: 'ganesh', name: 'Ganesh', nameHindi: 'गणेश', description: 'Remover of obstacles', emoji: '🐘', colorClass: 'bg-yellow-500', bhajanCount: 25, imageUrl: deityGanesh },
  { id: 7, slug: 'sai-baba', name: 'Sai Baba', nameHindi: 'साईं बाबा', description: 'Saint of Shirdi', emoji: '✨', colorClass: 'bg-amber-400', bhajanCount: 20, imageUrl: deitySaiBaba },
  { id: 8, slug: 'lakshmi', name: 'Lakshmi', nameHindi: 'लक्ष्मी', description: 'Goddess of wealth and prosperity', emoji: '🪷', colorClass: 'bg-pink-500', bhajanCount: 22, imageUrl: deityLakshmi },
  { id: 9, slug: 'khatu-shyam', name: 'Khatu Shyam', nameHindi: 'खाटू श्याम', description: 'The compassionate form of Barbarika revered as Shyam Baba', emoji: '🏇', colorClass: 'bg-rose-500', bhajanCount: 12 },
];

export const bhajans: Bhajan[] = [
  {
    id: 1, slug: 'hare-krishna-mahamantra', title: 'Hare Krishna Mahamantra', titleHindi: 'हरे कृष्ण महामंत्र',
    deityId: 1, singerName: 'Jagjit Singh', playCount: 125000, rating: 4.9, featured: true,
    tags: ['morning', 'meditative', 'peaceful'],
    lyricsHindi: 'हरे कृष्ण हरे कृष्ण\nकृष्ण कृष्ण हरे हरे\nहरे राम हरे राम\nराम राम हरे हरे\n\nहरे कृष्ण हरे कृष्ण\nकृष्ण कृष्ण हरे हरे\nहरे राम हरे राम\nराम राम हरे हरे',
    lyricsTransliteration: 'Hare Krishna Hare Krishna\nKrishna Krishna Hare Hare\nHare Rama Hare Rama\nRama Rama Hare Hare\n\nHare Krishna Hare Krishna\nKrishna Krishna Hare Hare\nHare Rama Hare Rama\nRama Rama Hare Hare',
  },
  {
    id: 2, slug: 'om-jai-shiv-omkara', title: 'Om Jai Shiv Omkara', titleHindi: 'ॐ जय शिव ओमकारा',
    deityId: 2, singerName: 'Anuradha Paudwal', playCount: 98000, rating: 4.8, featured: true,
    tags: ['evening', 'aarti'],
    lyricsHindi: 'ॐ जय शिव ओमकारा\nस्वामी जय शिव ओमकारा\nब्रह्मा विष्णु सदाशिव\nअर्धांगी धारा\nॐ जय शिव ओमकारा\n\nएकानन चतुरानन पंचानन राजे\nहंसासन गरुड़ासन वृषवाहन साजे\nॐ जय शिव ओमकारा',
    lyricsTransliteration: 'Om Jai Shiv Omkara\nSwami Jai Shiv Omkara\nBrahma Vishnu Sadashiv\nArdhangee Dhara\nOm Jai Shiv Omkara\n\nEkanan Chaturanan Panchanan Raaje\nHansasan Garudasan Vrishvahan Saaje\nOm Jai Shiv Omkara',
  },
  {
    id: 3, slug: 'hanuman-chalisa', title: 'Hanuman Chalisa', titleHindi: 'हनुमान चालीसा',
    deityId: 3, singerName: 'Hariharan', playCount: 250000, rating: 5.0, featured: true,
    tags: ['morning', 'energetic', 'festival'],
    lyricsHindi: 'श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।\nबरनउँ रघुबर बिमल जसु, जो दायकु फल चारि।।\n\nबुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।\nबल बुद्धि विद्या देहु मोहिं, हरहु कलेस विकार।।\n\nजय हनुमान ज्ञान गुन सागर।\nजय कपीस तिहुँ लोक उजागर।।',
    lyricsTransliteration: 'Shree Guru Charan Saroj Raj, Nij Manu Mukuru Sudhaari\nBaranau Raghubar Bimal Jasu, Jo Dayaku Phal Chaari\n\nBuddhiheen Tanu Jaanike, Sumirau Pavan Kumar\nBal Buddhi Vidya Dehu Mohi, Harahu Kalesh Vikaar\n\nJai Hanuman Gyan Gun Sagar\nJai Kapis Tihun Lok Ujagar',
  },
  {
    id: 4, slug: 'raghupati-raghav-raja-ram', title: 'Raghupati Raghav Raja Ram', titleHindi: 'रघुपति राघव राजा राम',
    deityId: 4, singerName: 'Lata Mangeshkar', playCount: 180000, rating: 4.7, featured: true,
    tags: ['peaceful', 'evening', 'meditative'],
    lyricsHindi: 'रघुपति राघव राजा राम\nपतित पावन सीता राम\nसीता राम सीता राम\nभज प्यारे तू सीता राम\n\nईश्वर अल्लाह तेरो नाम\nसबको सन्मति दे भगवान',
    lyricsTransliteration: 'Raghupati Raghav Raja Ram\nPatit Pavan Sita Ram\nSita Ram Sita Ram\nBhaj Pyare Tu Sita Ram\n\nIshwar Allah Tero Naam\nSabko Sanmati De Bhagwan',
  },
  {
    id: 5, slug: 'jai-ambe-gauri', title: 'Jai Ambe Gauri', titleHindi: 'जय अम्बे गौरी',
    deityId: 5, singerName: 'Anuradha Paudwal', playCount: 85000, rating: 4.6, featured: false,
    tags: ['aarti', 'navratri', 'festival'],
    lyricsHindi: 'जय अम्बे गौरी, मैया जय श्यामा गौरी।\nतुमको निशिदिन ध्यावत, हरि ब्रह्मा शिवरी।।\nजय अम्बे गौरी।\n\nमांग सिन्दूर विराजत, टीको मृगमद को।\nउज्ज्वल से दोउ नैना, चन्द्रवदन नीको।।',
    lyricsTransliteration: 'Jai Ambe Gauri, Maiya Jai Shyama Gauri\nTumko Nishidin Dhyavat, Hari Brahma Shivri\nJai Ambe Gauri\n\nMaang Sindoor Virajat, Teeko Mrigmad Ko\nUjjwal Se Dou Naina, Chandravadan Neeko',
  },
  {
    id: 6, slug: 'ganesh-aarti', title: 'Jai Ganesh Deva', titleHindi: 'जय गणेश देवा',
    deityId: 6, singerName: 'SP Balasubrahmanyam', playCount: 142000, rating: 4.8, featured: true,
    tags: ['aarti', 'morning', 'festival'],
    lyricsHindi: 'जय गणेश जय गणेश जय गणेश देवा।\nमाता जाकी पार्वती पिता महादेवा।।\n\nएकदन्त दयावन्त चार भुजाधारी।\nमाथे पर तिलक सोहे मूसे की सवारी।।',
    lyricsTransliteration: 'Jai Ganesh Jai Ganesh Jai Ganesh Deva\nMata Jaki Parvati Pita Mahadeva\n\nEkdant Dayavant Char Bhujadhaaree\nMaathe Par Tilak Sohe Moose Ki Sawaaree',
  },
  {
    id: 7, slug: 'sai-baba-aarti', title: 'Sai Baba Aarti', titleHindi: 'साईं बाबा आरती',
    deityId: 7, singerName: 'Suresh Wadkar', playCount: 72000, rating: 4.5, featured: false,
    tags: ['aarti', 'evening'],
    lyricsHindi: 'आरती साईं बाबा, सौख्यदातारा जीवा\nचरणरजातली ध्यावा, दासां विसावा\nभक्तां विसावा\nआरती साईं बाबा',
    lyricsTransliteration: 'Aarti Sai Baba, Saukhyadataara Jeeva\nCharanrajatali Dhyava, Dasan Visava\nBhaktan Visava\nAarti Sai Baba',
  },
  {
    id: 8, slug: 'om-jai-lakshmi-mata', title: 'Om Jai Lakshmi Mata', titleHindi: 'ॐ जय लक्ष्मी माता',
    deityId: 8, singerName: 'Anuradha Paudwal', playCount: 95000, rating: 4.7, featured: false,
    tags: ['aarti', 'diwali', 'festival'],
    lyricsHindi: 'ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।\nतुमको निशिदिन सेवत, हरि विष्णु विधाता।।\nॐ जय लक्ष्मी माता।',
    lyricsTransliteration: 'Om Jai Lakshmi Mata, Maiya Jai Lakshmi Mata\nTumko Nishidin Sevat, Hari Vishnu Vidhaata\nOm Jai Lakshmi Mata',
  },
  {
    id: 9, slug: 'achyutam-keshavam', title: 'Achyutam Keshavam', titleHindi: 'अच्युतम् केशवम्',
    deityId: 1, singerName: 'Madhav Shivpuri', playCount: 110000, rating: 4.8, featured: false,
    tags: ['morning', 'peaceful', 'janmashtami'],
    lyricsHindi: 'अच्युतम् केशवम् रामनारायणम्\nकृष्णदामोदरम् वासुदेवम् हरिम्\nश्रीधरम् माधवम् गोपिकावल्लभम्\nजानकीनायकम् रामचन्द्रम् भजे',
    lyricsTransliteration: 'Achyutam Keshavam Ramanarayanam\nKrishnadamodaram Vasudevam Harim\nShridharam Madhavam Gopikavallabham\nJanakinayakam Ramachandram Bhaje',
  },
  {
    id: 10, slug: 'shiv-tandav-stotram', title: 'Shiv Tandav Stotram', titleHindi: 'शिव तांडव स्तोत्रम्',
    deityId: 2, singerName: 'Shankar Mahadevan', playCount: 200000, rating: 4.9, featured: true,
    tags: ['energetic', 'morning', 'festival'],
    lyricsHindi: 'जटाटवीगलज्जलप्रवाहपावितस्थले\nगलेऽवलम्ब्यलम्बितां भुजंगतुंगमालिकाम्।\nडमड्डमड्डमड्डमन्निनादवड्डमर्वयं\nचकार चण्डताण्डवं तनोतु नः शिवः शिवम्।।',
    lyricsTransliteration: 'Jatatavigalajjala Pravahapavitasthale\nGalavlambya Lambitam Bhujangtunga Malikam\nDamad Damad Damad Damanninada Vaddamarvayam\nChakara Chandtandavam Tanotu Nah Shivah Shivam',
  },
  {
    id: 11, slug: 'bajrang-baan', title: 'Bajrang Baan', titleHindi: 'बजरंग बाण',
    deityId: 3, singerName: 'Gulshan Kumar', playCount: 160000, rating: 4.7, featured: false,
    tags: ['energetic', 'morning'],
    lyricsHindi: 'निश्चय प्रेम प्रतीति ते, विनय करें सनमान।\nतेहि के कारज सकल शुभ, सिद्ध करें हनुमान।।\n\nजय हनुमन्त संत हितकारी\nसुन लीजै प्रभु अरज हमारी',
    lyricsTransliteration: 'Nishchay Prem Pratiti Te, Vinay Karein Sanmaan\nTehi Ke Karaj Sakal Shubh, Siddh Karein Hanumaan\n\nJai Hanumant Sant Hitkaari\nSun Leejai Prabhu Araj Hamaari',
  },
  {
    id: 12, slug: 'ram-dhun', title: 'Ram Dhun', titleHindi: 'राम धुन',
    deityId: 4, singerName: 'Anup Jalota', playCount: 75000, rating: 4.5, featured: false,
    tags: ['meditative', 'peaceful', 'evening'],
    lyricsHindi: 'श्री राम जय राम जय जय राम\nश्री राम जय राम जय जय राम\n\nसीता राम सीता राम\nसीता राम जय सीता राम',
    lyricsTransliteration: 'Shri Ram Jai Ram Jai Jai Ram\nShri Ram Jai Ram Jai Jai Ram\n\nSita Ram Sita Ram\nSita Ram Jai Sita Ram',
  },
];

export function getDeityById(id: number): Deity | undefined {
  return deities.find(d => d.id === id);
}

export function getDeityBySlug(slug: string): Deity | undefined {
  return deities.find(d => d.slug === slug);
}

export function getBhajansByDeity(deityId: number): Bhajan[] {
  return bhajans.filter(b => b.deityId === deityId);
}

export function getFeaturedBhajans(): Bhajan[] {
  return bhajans.filter(b => b.featured);
}

export function searchBhajans(query: string, source: Bhajan[] = bhajans): Bhajan[] {
  return smartSearchBhajans(query, source) as Bhajan[];
}
