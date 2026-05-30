import { smartSearchBhajans } from '@/lib/searchAlgorithm';

import deityKrishna from '@/assets/deities/krishna.webp';
import deityShiva from '@/assets/deities/shiva.webp';
import deityHanuman from '@/assets/deities/hanuman.webp';
import deityRama from '@/assets/deities/rama.webp';
import deityDurga from '@/assets/deities/durga.webp';
import deityGanesh from '@/assets/deities/ganesh.webp';
import deitySaiBaba from '@/assets/deities/sai-baba.webp';
import deityLakshmi from '@/assets/deities/lakshmi.webp';

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
  { id: 1, slug: 'krishna', name: 'Krishna', nameHindi: 'कृष्ण', description: 'Lord of compassion, tenderness, and love', emoji: '🪈', colorClass: 'bg-blue-500', bhajanCount: 19, imageUrl: deityKrishna },
  { id: 2, slug: 'shiva', name: 'Shiva', nameHindi: 'शिव', description: 'The transformer and destroyer', emoji: '🔱', colorClass: 'bg-orange-600', bhajanCount: 4, imageUrl: deityShiva },
  { id: 3, slug: 'hanuman', name: 'Hanuman', nameHindi: 'हनुमान', description: 'Symbol of strength and devotion', emoji: '🙏', colorClass: 'bg-orange-500', bhajanCount: 4, imageUrl: deityHanuman },
  { id: 4, slug: 'rama', name: 'Rama', nameHindi: 'राम', description: 'Ideal man and righteous king', emoji: '🏹', colorClass: 'bg-green-600', bhajanCount: 3, imageUrl: deityRama },
  { id: 5, slug: 'durga', name: 'Durga', nameHindi: 'दुर्गा', description: 'Goddess of protection and strength', emoji: '🌺', colorClass: 'bg-red-600', bhajanCount: 1, imageUrl: deityDurga },
  { id: 6, slug: 'ganesh', name: 'Ganesh', nameHindi: 'गणेश', description: 'Remover of obstacles', emoji: '🐘', colorClass: 'bg-yellow-500', bhajanCount: 1, imageUrl: deityGanesh },
  { id: 7, slug: 'sai-baba', name: 'Sai Baba', nameHindi: 'साईं बाबा', description: 'Saint of Shirdi', emoji: '✨', colorClass: 'bg-amber-400', bhajanCount: 1, imageUrl: deitySaiBaba },
  { id: 8, slug: 'lakshmi', name: 'Lakshmi', nameHindi: 'लक्ष्मी', description: 'Goddess of wealth and prosperity', emoji: '🪷', colorClass: 'bg-pink-500', bhajanCount: 1, imageUrl: deityLakshmi },
  { id: 9, slug: 'khatu-shyam', name: 'Khatu Shyam', nameHindi: 'खाटू श्याम', description: 'The compassionate form of Barbarika revered as Shyam Baba', emoji: '🏇', colorClass: 'bg-rose-500', bhajanCount: 38 },
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
  {
    id: 13,
    slug: 'hum-sab-bolenge-happy-birthday-to-you',
    title: 'Hum Sab Bolenge Happy Birthday To You',
    titleHindi: 'हम सब बोलेंगे हैप्पी बर्थडे टू यू',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['janmashtami', 'celebration', 'birthday'],
    lyricsHindi: `रंगीन गुब्बारों से मंडप सजाया है
मिश्री मावे का एक केक माँगाया है
इसको चखेगा श्याम तू तू तू तू
हम सब बोलेंगे हैप्पी बर्थडे टू यू
हैप्पी बर्थडे टू यू श्याम
हैप्पी बर्थडे टू यू कृष्णा

रंगी गुब्बारों से मंडप सजाया है
मिश्री मावे का एक केक मंगाया है
जीसको चखेगा श्याम तू तू
हम सब बोलेंगे हैप्पी बर्थडे टू यू श्याम

एक बरस पूरा हुआ इंतजार का
आया है जनम दिन मदन मुरार का

भादो की अष्टमी है
मौसम बहार के
सपना हुआ है पूरा दिल बेकरार के

कब कैसे चुप में रह
रह रह रह रह
हम सब बोलेंगे हैप्पी बर्थडे टू यू श्याम
हैप्पी बर्थडे टू यू श्याम

ओ श्याम तोहफा तुम्हारे लिए कुछ भी ना लए हैं
दर्शन दिखते रहना कहने ये आए हैं

प्राण हमारा है तू रे साँवरिया
तुमको लग जाये श्याम मेरी मारिया
इसके शिव तुझको क्या दु दु द
हम सब बोलेंगे हैप्पी बर्थडे टू यू श्याम

दुनिया दीवानी तेरे पीछे तो मेला है
इन सब में श्याम तेरा लख्खा अकेला है

मुझसे निभाते रहना बस अपनी यारी को
भूल ना जाना श्याम अपने बिहारी को
और समझो ज्यादा क्यों क्यों क्यों
हम सब बोलेंगे हैप्पी बर्थडे टू यू श्याम`,
    lyricsTransliteration: '',
    videoEmbedId: 'riQrTUc6kKA',
    youtubeUrl: 'https://www.youtube.com/watch?v=riQrTUc6kKA&list=RDriQrTUc6kKA&start_radio=1&pp=ygVn4KS54KSuIOCkuOCkrCDgpKzgpYvgpLLgpYfgpILgpJfgpYcg4KS54KWI4KSq4KWN4KSq4KWAIOCkrOCksOCljeCkpeCkoeClhyDgpJ_gpYIg4KSv4KWCIOCktuCljeCkr-CkvuCkrqAHAQ%3D%3D',
  },
  {
    id: 14,
    slug: 'bolo-to-sahi-bolo-to-sahi',
    title: 'Bolo To Sahi Bolo To Sahi',
    titleHindi: 'बोलो तो सही, बोलो तो सही',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'devotional', 'rajasthani'],
    lyricsHindi: `बोलो तो सही, बोलो तो सही ॥
क्यूँ रूठ्या हो बाबा आँख्या खोलो तो सही
बोलो तो सही, बोलो तो सही ॥

आसरो थारो है, भरोसो थारो है,
जो कुछ भी म्हारो है वो सब कुछ थारो है,
ज्यादा कोनी माँगू, थोड़ो देवो तो सही,
ज्यादा कोनी माँगू थोड़ो देवो तो सही,
बोलो तो सही, बोलो तो सही........
क्यूँ रूठ्या हो बाबा आँख्या खोलो तो सही........

या अरजी म्हारी है, पर मरजी थारी है,
थारे से साँवरिया पुरानी यारी है,
टाबरिया के कानी मुखड़ो, मोड़ो तो सही,
टाबरिया के कानी मुखड़ो, मोड़ो तो सही,
बोलो तो सही, बोलो तो सही..........
क्यूँ रूठ्या हो बाबा आँख्या खोलो तो सही.....

रूठ कर साँवरिया कठे थे जावोला,
यो म्हाने बैरो है थे रह नहीं पाओला,
शुभम रूपम को रिश्तो म्हास्यू जोड़ो तो सही,
शुभम रूपम को रिश्तो म्हास्यू जोड़ो तो सही,
बोलो तो सही, बोलो तो सही,
क्यूँ रूठ्या हो बाबा आँख्या खोलो तो सही....`,
    lyricsTransliteration: '',
    videoEmbedId: 'QJPiS8HGEd8',
    youtubeUrl: 'https://www.youtube.com/watch?v=QJPiS8HGEd8&list=RDQJPiS8HGEd8&start_radio=1&pp=ygVU4KSs4KWL4KSy4KWLIOCkpOCliyDgpLjgpLngpYAg4KSV4KWN4KSv4KWC4KSBIOCksOClguCkoOCljeCkr-CkviDgpLngpYsg4KSs4KS-4KSs4KS-oAcB',
  },
  {
    id: 15,
    slug: 'aaja-mere-kanhaiya',
    title: 'Aaja Mere Kanhaiya',
    titleHindi: 'आजा मेरे कन्हैया',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['prayer', 'peaceful', 'devotional'],
    lyricsHindi: `आजा मेरे कन्हैया बिन माझी के सहारे,
डूभे गी मेरी नैया आजा मेरे कन्हैया,
बीच भवर में नैया बन जाओ श्याम खवड़याँ,
आजा मेरे कन्हैया......

बैठे है आप ऐसे सुनता नहीं हो जैसे,
नैया हमारी मोहन उतरेगी पार कैसे,
तुझे क्या पता नहीं है मझधार में पड़ी है,
आजा मेरे कन्हैया.....

मेहनत से हमने अपनी नैया ठीक बनाई,
लेकिन भवर में मोहन कोशिश न काम आई,
हारे है हम तो जब भी तूफानों से लड़े है,
आजा मेरे कन्हैया........

पतवार खेते खेते आखिर में थक गया हूँ,
श्याद तू आता होगा कुछ देर रुक गया हूँ,
बनवारी बेबसी में चुप चाप हम खड़े हैं,
आजा मेरे कन्हैया........`,
    lyricsTransliteration: '',
    videoEmbedId: 'mJle5chfrAQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=mJle5chfrAQ&list=RDmJle5chfrAQ&start_radio=1&pp=ygVa4KSG4KSc4KS-IOCkruClh-CksOClhyDgpJXgpKjgpY3gpLngpYjgpK_gpL4g4KSs4KS_4KSoIOCkruCkvuCkneClgCDgpJXgpYcg4KS44KS54KS-4KSw4KWHoAcB',
  },
  {
    id: 16,
    slug: 'jhalak-pehle-jaisi-dikhani-padegi',
    title: 'Jhalak Pehle Jaisi Dikhani Padegi',
    titleHindi: 'झलक पहले जैसी दिखानी पड़ेगी',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['longing', 'devotional', 'krishna'],
    lyricsHindi: `झलक पहले जैसी दिखानी पड़ेगी,
लगी आग दिल की बुझानी पड़ेगी॥

तर्ज – तेरे प्यार का आसरा।

सलोनी अदा पे ये दिल हार बैठा,
तुम्हारे भरोसे पे सरकार बैठा,
अधिक देर करना गवारा ना होगा,
मधुर बैन फिर से सुनानी पड़ेगी,
लगी आग दिल की बुझानी पड़ेगी॥

दिला दूँगा अपनी कसम में मुरारी,
पड़ी कितनी महँगी सनम तेरी यारी,
ना छोड़ूंगा तुमको ये वादा मेरा है,
नजर से नजर फिर मिलानी पड़ेगी,
लगी आग दिल की बुझानी पड़ेगी॥

बिना ही वजह क्यूँ सजा दे रहे हो,
मोहब्बत का कैसा मज़ा दे रहे हो,
गुनहगार हूँ तेरा फिर भी मुरारी,
पुरानी लगन है निभानी पड़ेगी,
लगी आग दिल की बुझानी पड़ेगी॥

यही श्यामबहादुर भी कहते रहे हैं,
सीतम श्याम सुंदर का सहते रहे हैं,
सबल को नहीं कोई कहता है दोषी,
तरस साँवले 'शिव' पे खानी पड़ेगी,
लगी आग दिल की बुझानी पड़ेगी॥`,
    lyricsTransliteration: '',
    videoEmbedId: '5adnLq807Ss',
    youtubeUrl: 'https://www.youtube.com/watch?v=5adnLq807Ss&list=RD5adnLq807Ss&start_radio=1&pp=ygVJ4KSd4KSy4KSVIOCkquCkueCksuClhyDgpJzgpYjgpLjgpYAg4KSm4KS_4KSW4KS-4KSo4KWAIOCkquCkoeCkvOClh-Ckl-ClgKAHAQ%3D%3D',
  },
  {
    id: 17,
    slug: 'maanga-hai-maine-shyam-se-vardaan',
    title: 'Maanga Hai Maine Shyam Se Vardaan',
    titleHindi: 'माँगा है मैंने श्याम से वरदान',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'blessing', 'devotional'],
    lyricsHindi: `माँगा है मैंने श्याम से, वरदान एक ही,
माँगा है मैंने श्याम से, वरदान एक ही,
तेरी कृपा बनी रहे, जब तक है जिंदगी,
माँगा है मैंने श्याम से, वरदान एक ही।

जिस पर प्रभु का हाथ था, वो पार हो गया,
जो भी शरण में आ गया, उद्धार हो गया,
जिसका भरोसा श्याम पे, डूबा कभी नहीं,
माँगा है मैंने श्याम से, वरदान एक ही॥

कोई समझ सका नहीं, माया बड़ी अजीब,
जिसने प्रभु को पा लिया, है वो खुशनसीब,
इनकी मर्जी के बिना,पता हिले नहीं,
माँगा है मैंने श्याम से, वरदान एक ही॥

ऐसे दयालु श्याम से, रिश्ता बनाइये,
मिलता रहेगा आपको, जो कुछ भी चाहिए,
ऐसा करिश्मा होगा जो, पहले हुआ नहीं,
माँगा है मैंने श्याम से, वरदान एक ही॥

कहते हैं लोग जिंदगी, किस्मत की बात है,
किस्मत बनाना भी मगर, इनके ही हाथ है,
बनवारी कर यकीन अब, ज्यादा समय नहीं,
माँगा है मैंने श्याम से, वरदान एक ही,
तेरी कृपा बनी रहे, जब तक है जिंदगी,
माँगा है मैंने श्याम से, वरदान एक ही......`,
    lyricsTransliteration: '',
    videoEmbedId: 'EXCf1Z8-gzQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=EXCf1Z8-gzQ&list=RDEXCf1Z8-gzQ&start_radio=1&pp=ygVN4KSu4KS-4KSB4KSX4KS-IOCkueCliCDgpK7gpYjgpILgpKjgpYcg4KS24KWN4KSv4KS-4KSuIOCkuOClhyDgpLXgpLDgpKbgpL7gpKigBwE%3D',
  },
  {
    id: 18,
    slug: 'hai-dukh-bhanjan-maruti-nandan-sun-lo-meri-pukaar',
    title: 'Hai Dukh Bhanjan Maruti Nandan Sun Lo Meri Pukaar',
    titleHindi: 'है दुःख भंजन मारुति नंदन सुन लो मेरी पुकार',
    deityId: 3,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['hanuman', 'prayer', 'devotional'],
    lyricsHindi: `है दुःख भंजन, मारुति नंदन, सुन लो मेरी पुकार ।
पवनसुत विनती बारम्बार ॥

अष्ट सिद्धि नव निधि के दाता, दुःखिओं के तुम भाग्यविदाता ।
सियाराम के काज सवारे, मेरा करो उद्धार ॥

अपरम्पार है शक्ति तुम्हारी, तुम पर रीझे अवधविहारी ।
भक्ति भाव से ध्याऊँ तुम्हें, कर दुखों से पार ॥

जपू निरंतर नाम तिहारा, अब नहीं छोड़ू तेरा द्वारा ।
राम भक्त मोहैं शरण में लीजे भव सागर से तार ॥`,
    lyricsTransliteration: '',
    videoEmbedId: 'L2ZSKlaX7lU',
    youtubeUrl: 'https://www.youtube.com/watch?v=L2ZSKlaX7lU&list=RDL2ZSKlaX7lU&start_radio=1&pp=ygVu4KS54KWIIOCkpuClgeCkg-CkliDgpK3gpILgpJzgpKgg4KSu4KS-4KSw4KWB4KSk4KS_IOCkqOCkguCkpuCkqCDgpLjgpYHgpKgg4KSy4KWLIOCkruClh-CksOClgCDgpKrgpYHgpJXgpL7gpLCgBwHSBwkJCgsBhyohjO8%3D',
  },
  {
    id: 19,
    slug: 'mujhe-aasra-hai-shyam-khatu-wale',
    title: 'Mujhe Aasra Hai Shyam Khatu Wale',
    titleHindi: 'मुझे आसरा है श्याम खाटू वाले',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'faith', 'devotional'],
    lyricsHindi: `हमको तो आसरा है है श्याम मुरली वाले,
है श्याम खाटू वाले,

कैसे कसू गा मोहन में गेहरी नदिया,
ना नाव का ठिकाना ना पास है खवैया,
कोई नहीं हमारा मुझे पार जो उतारे,
हमको तो आसरा है .....

मैं तो तेरे भरोसे आगे को बढ़ता आया,
मुझको गरज है किसकी मुझपर तुम्हारा साया,
जब साथ है तुम्हारा फिर कौन क्या बिगड़े,
हमको तो आसरा है .......

अब क्या कसू मैं बोलो तुम भी नज़र नहीं आते,
विश्वास है कनहिया आवो क्यों सताते,
नंदू सुनो न मोहन नैया तेरे हवाले,
हमको तो आसरा है ........`,
    lyricsTransliteration: '',
    videoEmbedId: 'FqlePJvrIE0',
    youtubeUrl: 'https://www.youtube.com/watch?v=FqlePJvrIE0&list=RDFqlePJvrIE0&start_radio=1&pp=ygVK4KSu4KWB4KSd4KWHIOCkhuCkuOCksOCkviDgpLngpYgg4KS24KWN4KSv4KS-4KSuIOCkluCkvuCkn-ClgiDgpLXgpL7gpLLgpYegBwE%3D',
  },
  {
    id: 20,
    slug: 'sunle-kanhaiyan-arji-hamari',
    title: 'Sunle Kanhaiyan Arji Hamari',
    titleHindi: 'सुनले कन्हैयाँ अर्जी हमारी',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['prayer', 'krishna', 'devotional'],
    lyricsHindi: `सुनले कन्हैयाँ अर्जी हमारी,
तारो न तारो ये है मज़ी तुम्हारी,

हम पे काया बीती कैसे बताये,
किस दौर से गुजरे कैसे सुनाये,
तुम को पता है हाल मुरारी,
सुनले कन्हैयाँ अर्जी हमारी,

लाज पे आंच बाबा आने न पाये,
जाये तो जान जाये आन न जाये,
सारा ज़माना इस का शिकारी,
सुनले कन्हैयाँ अर्जी हमारी,

लाज की बिकशा झोली में देदो,
भटक रहा हूँ शरण में लेलो,
दर पे खड़ा है तेरा भिखारी,
सुनले कन्हैयाँ अर्जी हमारी,

जो भी कहो गे वो ही कसू गा,
जैसे रखो गे वैसे रहूँगा,
तुझपे भरोसा मेरा है भारी,
सुनले कन्हैयाँ अर्जी हमारी,`,
    lyricsTransliteration: '',
    videoEmbedId: 'xNLvAdpvqSU',
    youtubeUrl: 'https://www.youtube.com/watch?v=xNLvAdpvqSU&list=RDxNLvAdpvqSU&start_radio=1&pp=ygVI4KS44KWB4KSo4KSy4KWHIOCkleCkqOCljeCkueCliOCkr-CkvuCkgSDgpIXgpLDgpY3gpJzgpYAg4KS54KSu4KS-4KSw4KWAoAcB',
  },
  {
    id: 21,
    slug: 'bolo-bolo-thari-manihar-ke-kasoor',
    title: 'Bolo Bolo Thari Manihar Ke Kasoor',
    titleHindi: 'बोलो बोलो थारी मनिहार के कसूर',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'devotional', 'rajasthani'],
    lyricsHindi: `बोलो जी दयालु दिल दार के कसूर,
बोलो बोलो थारी मनुहार के कसूर,

मन को नगीना,हाणे सूप दियो,
जान के प्रभु, दर्द मोल लियो,
जित और हार को विचार के कसूर,
बोलो बोलो थारी मनुहार.......

मेरे कने थे काई छोड़यो है,
छलिये सू रिस्तो जोड़यो है,
नेहड़ो लगाके,तकरार के कसूर,
बोलो बोलो थारी मनुहार.......

फाँस लियो मीठी मीठी बाता में,
बिक गयो जिव थारे हाथा में,
थारे से अकड़ करतार के कसूर,
बोलो बोलो थारी मनुहार.......

जान के गरीब क्यूँ इ रहम करो,
विनती पर प्रभु मेरी ध्यान धरो,
जीवन की पतवार के,रखवार के कसूर,
बोलो बोलो थारी मनुहार.......

श्याम बहादुर शिव रसिया,
हँस बतलाओ,मेरे मन बसिया,
लागी मेरे नेह की कटार के कसूर,
बोलो बोलो थारी मनुहार.......`,
    lyricsTransliteration: '',
    videoEmbedId: '1O0TMWbVxA8',
    youtubeUrl: 'https://www.youtube.com/watch?v=1O0TMWbVxA8&list=RD1O0TMWbVxA8&start_radio=1&pp=ygVN4KSs4KWL4KSy4KWLIOCkrOCli-CksuCliyDgpKXgpL7gpLDgpYAg4KSu4KSo4KS_4KS54KS-4KSwIOCkleClhyDgpJXgpLjgpYLgpLCgBwE%3D',
  },
  {
    id: 22,
    slug: 'man-ki-batan-sanwariye-ne',
    title: 'Man Ki Batan Sanwariye Ne',
    titleHindi: 'मन की बाताँ संवारिये ने',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'satsang', 'rajasthani'],
    lyricsHindi: `मन की बाताँ संवारिये ने,
आज सुना कर देख ले,
सुणसी सुणसी संवारियो टेर लगा के देख ले,.
मन की बाताँ संवारिये ने....

गल्ली गल्ली क्यों भटक रहे हैं,
श्याम खड़े तेरे आगे,
तेरी पीड़ा वोही हरेगा,
चालेगो तेरे सागे,
गेलो टेढ़ो बाबो सीधो बदले भाग्य की रेख रे,
मन की बाताँ संवारिये ने,

दुनिया से के आस करे से श्याम ही सांचो साथी,
मन दिवले ले जगमगा कर ले,
घाल प्रेम की बाती,
रोम रोम श्याम रमा ले फिर तमाशा देख ले,
मन की बाताँ संवारिये ने,

खाटू माहिं लगी कचेरी श्याम करे सुनवाई,
सांचो न्याय चुकातो आयो जाने पीड़ पराई,
अनिल सुना दे बाता सारी चरणों माथा टेक ले,
मन की बाताँ संवारिये ने,`,
    lyricsTransliteration: '',
    videoEmbedId: 'MptzdyzIyVE',
    youtubeUrl: 'https://www.youtube.com/watch?v=MptzdyzIyVE&list=RDMptzdyzIyVE&start_radio=1&pp=ygU94KSu4KSoIOCkleClgCDgpKzgpL7gpKTgpL7gpIEg4KS44KSC4KS14KS-4KSw4KS_4KSv4KWHIOCkqOClh6AHAQ%3D%3D',
  },
  {
    id: 23,
    slug: 'mahadev-shiv-ki-hai-dono-santan',
    title: 'Mahadev Shiv Ki Hai Dono Santan',
    titleHindi: 'महादेव शिव की है दोनो संतान',
    deityId: 2,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['shiva', 'hanuman', 'devotional'],
    lyricsHindi: `महादेव शिव की है दोनो संतान,
तर्ज – श्याम तेरी बंसी पुकारे।

दोहा – रविवार भैरव भजो,
मंगल शनि हनुमान.
सब संकट टल जाये 'लख्खा',
हो जाये कल्याण।

महादेव शिव की है दोनो संतान,
एक बलि भैरव तो दूजे हनुमान॥

एक तन सिंदूरी है एक रूप काला,
दुनिया में दोनो का है बोलबाला,
दोनो में विषमता है फिर भी समान,
एक बलि भैरव तो दूजे हनुमान॥

एक राम का भक्त दूजा शिव दुलारा,
दोनों ने भगतों का संकट है टारा,
इनके जैसे सेवक ना जग में महान,
एक बलि भैरव तो दूजे हनुमान॥

दुष्टों को चुन चुनके हनुमान छाँटा,
'लख्खा' भैरव ने शीश ब्रह्मा का काँटा,
'बेधड़क' इनका तु करले गुणगान,
एक बलि भैरव तो दूजे हनुमान॥`,
    lyricsTransliteration: '',
    videoEmbedId: 'bX5uOgNL5TA',
    youtubeUrl: 'https://www.youtube.com/watch?v=bX5uOgNL5TA&list=RDbX5uOgNL5TA&start_radio=1&pp=ygVH4KSu4KS54KS-4KSm4KWH4KS1IOCktuCkv-CktSDgpJXgpYAg4KS54KWIIOCkpuCli-CkqOCliyDgpLjgpILgpKTgpL7gpKigBwE',
  },
  {
    id: 24,
    slug: 'shyam-baba-shyam-baba',
    title: 'Shyam Baba Shyam Baba',
    titleHindi: 'श्याम बाबा श्याम बाबा',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'devotional', 'pilgrimage'],
    lyricsHindi: `श्याम बाबा श्याम बाबा आया हूँ मैं,
बड़ी दूर से ,बड़ी दूर से,
ओ अहैलवती का प्यारा देना सहारा,
बड़ी मुशिकलो से ढूँढा तेरा ये द्वारा,

खाटू वाले श्याम तुम्हीं कहलाते हो,
हर संकट में काम तुम्हीं तो आते हो,
दान शीश का तुम्हीं देने वाले हो,
लीले घोड़े वाले देव निराले हो,
ओ अहैलवती का प्यारा देना सहारा,
मुशिकलो से ढूँढा तेरा ये द्वारा,
श्याम बाबा श्याम बाबा आया हूँ मैं.......

हर दम तेरा ध्यान लगन मुझे तेरी है,
श्याम नाम की माला हर दम फेरी है,
दीना नाथ दयालु बेड़ा पार करो,
काम क्रोध मोह लोभ दूर एठकार करो,
ओ अहैलवती का प्यारा देना सहारा,
मुशिकलो से ढूँढा तेरा ये द्वारा,

खाटू जैसा देखा कोई धाम नहीं,
श्याम नाम सा पावन जग में दाम नहीं,
लख्खा को तेरी भक्ति बिना कोई काम नहीं,
करले भजन एह सरल तू लगता धाम नहीं,
ओ अहैलवती का प्यारा देना सहारा,
मुशिकलो से ढूँढा तेरा ये द्वारा,`,
    lyricsTransliteration: '',
    videoEmbedId: 'Dp3p5XNB3Qc',
    youtubeUrl: 'https://www.youtube.com/watch?v=Dp3p5XNB3Qc&list=RDDp3p5XNB3Qc&start_radio=1&pp=ygVX4KS24KWN4KSv4KS-4KSuIOCkrOCkvuCkrOCkviDgpLbgpY3gpK_gpL7gpK4g4KSs4KS-4KSs4KS-IOCkhuCkr-CkviDgpLngpYLgpIEg4KSu4KWI4KSCoAcB',
  },
  {
    id: 25,
    slug: 'jhule-radha-pyari-jhulaye-rahe-banke-bihari',
    title: 'Jhule Radha Pyari Jhulaye Rahe Banke Bihari',
    titleHindi: 'झूले राधा प्यारी झुलाए रहे बाँके बिहारी',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['jhulan', 'radha-krishna', 'sawan'],
    lyricsHindi: `झूले राधा प्यारी,
झुलाए रहे बाँके बिहारी॥

रेशम डोर कदम्ब बंधवाई,
कंचन पाती रतन जड़ाई,
वा पर भानु दुलारी,
झुलाए रहे बाँके बिहारी,
झूले राधा प्यारी,
झुलाए रहे बाँके बिहारी॥

रिमझिम रिमझिम सावन बरसे,
सज श्रंगार चली घर से,
देखन सब ब्रज नारी,
झुलाए रहे बाँके बिहारी,
झूले राधा प्यारी,
झुलाए रहे बाँके बिहारी॥

झूले श्यामा श्याम झुलावे,
सखियाँ राग मल्हार सुनावे,
मुरली बजे मतवाली,
झुलाए रहे बाँके बिहारी,
झूले राधा प्यारी,
झुलाए रहे बाँके बिहारी॥

तोता मैना कोयल बोले,
नाचे मोर मगन मन डोले,
महक रही फुलवारी,
झुलाए रहे बाँके बिहारी,
झूले राधा प्यारी,
झुलाए रहे बाँके बिहारी॥

झाँटा देत करे इकजोरी,
झूले जब श्री राधे गोरी,
'लख्खा' बिहारी जाए बलिहारी,
झुलाए रहे बाँके बिहारी,
झूले राधा प्यारी,
झुलाए रहे बाँके बिहारी॥`,
    lyricsTransliteration: '',
    videoEmbedId: 'cK-HoFSzM3c',
    youtubeUrl: 'https://www.youtube.com/watch?v=cK-HoFSzM3c&list=RDcK-HoFSzM3c&start_radio=1&pp=ygVp4KSd4KWC4KSy4KWHIOCksOCkvuCkp-CkviDgpKrgpY3gpK_gpL7gpLDgpYAg4KSd4KWB4KSy4KS-4KSPIOCksOCkueClhyDgpKzgpL7gpIHgpJXgpYcg4KSs4KS_4KS54KS-4KSw4KWAoAcB0gcJCQoLAYcqIYzv',
  },
  {
    id: 26,
    slug: 'kare-ne-kar-diyo-lal-julam-kar-daro',
    title: 'Kare Ne Kar Diyo Lal Julam Kar Daro',
    titleHindi: 'कारे ने कर दियो लाल जुलम कर डारो',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['holi', 'radha-krishna', 'festival'],
    lyricsHindi: `राधा आई, साखिया आयी, लेकर रंग गुलाल
काले रे काले कहना ने कैसो कर दियो लाल

जुलम कर डारो सितम कर डारो,
कारे ने कर दियो लाल, जुलम कर डारो!

1 अरे नजर मोहन मतवारो, राधा जी करे इशारो!
रे नैना सूँ करो कमाल, जुलम कर डारो!

2 सब घेर लियो ब्रज नारी, नखरारी गामन वारी!
के चली गजब की चाल, जुलम कर डारो!

3 काजल की डिबिया लायी अंगिया साड़ी पहनाई,
मुखड़े पे मलो गुलाल, जुलम कर डारो!

4 लियो पकड़ बिहारी कसके, रंग दियो खूब हँस हँस के!
बोली फिर आइयो नंदलाल, जुलम कर डारो!`,
    lyricsTransliteration: '',
    videoEmbedId: 'gmUPxafCmz8',
    youtubeUrl: 'https://www.youtube.com/watch?v=gmUPxafCmz8&list=RDgmUPxafCmz8&start_radio=1&pp=ygVS4KSV4KS-4KSw4KWHIOCkqOClhyDgpJXgpLAg4KSm4KS_4KSv4KWLIOCksuCkvuCksiDgpJzgpYHgpLLgpK4g4KSV4KSwIOCkoeCkvuCksOCli6AHAQ%3D%3D',
  },
  {
    id: 27,
    slug: 'banke-bihari-ki-dekh-chhata',
    title: 'Banke Bihari Ki Dekh Chhata',
    titleHindi: 'बाँके बिहारी की देख छटा',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['darshan', 'banke-bihari', 'vrindavan'],
    lyricsHindi: `बाँके बिहारी की देख छटा,
मेरो मन है गयो लटा पटा।

कब से खोजूं बनवारी को,
बनवारी को, गिरिधारी को।
कोई बता दे उसका पता,
मेरो मन है गयो लटा पटा॥

मोरे मुकुट श्यामल तन धारी,
कर मुरली अधरन सजी प्यारी।
कमर में बाँधे पीला पटा,
मेरो मन है गयो लटा पटा॥

पनिया भरन यमुना तट आई,
बीच में मिल गए कृष्ण कन्हाई।
फोर दियो पानी को घटा,
मेरो मन है गयो लटा पटा॥

टेढ़ी नज़रें लट घुमराली,
मार रही मेरे दिल पे कटारी।
और श्याम वरन जैसे कारी घटा,
मेरो मन है गयो लटा पटा॥

मिलते हैं उसे बाँके बिहारी,
बाँके बिहारी, सनेह बिहारी।
राधे राधे जिस ने रटा,
मेरो मन है गयो लटा पटा॥`,
    lyricsTransliteration: '',
    videoEmbedId: 'MhlocXvJshE',
    youtubeUrl: 'https://www.youtube.com/watch?v=MhlocXvJshE&list=RDMhlocXvJshE&start_radio=1&pp=ygU94KSs4KS-4KSB4KSV4KWHIOCkrOCkv-CkueCkvuCksOClgCDgpJXgpYAg4KSm4KWH4KSWIOCkm-Ckn-CkvqAHAQ%3D%3D',
  },
  {
    id: 28,
    slug: 'shyam-jhule-hanumat-jhule',
    title: 'Shyam Jhule Hanumat Jhule',
    titleHindi: 'श्याम झूले हनुमत झूले',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['jhulan', 'radha-krishna', 'sawan'],
    lyricsHindi: `श्याम झूले हनुमत झूले, झूले शंकर त्रिपुरारी,
राधा रानी झूला झूले, ओढ़े चुनर तारा री॥

कैलाश से भोले आए हैं, बजरंगी वीर पधारे हैं,
बजरंगी वीर पधारे हैं, जो राम के सेवक प्यारे हैं,
जो राम के सेवक प्यारे हैं, सब भक्तों के रखवारे हैं,
साखिया आई बरसाने से, मनमोहन की प्यारी,
राधा रानी झूला झूले, ओढ़े चुनर तारा री॥

सुन मुरली वाले की मुरली, बजरंग हुए मतवाले हैं,
बजरंग हुए मतवाले हैं, सुध भूले डमरू वाले हैं,
सुध भूले डमरू वेल हैं, जो माँगो देने वाले हैं,
राधे श्याम का दर्शन करने, देखो आये त्रिपुरारी,
राधा रानी झूला झूले, ओढ़े चुनर तारा री॥

हनुमान झूले भोले झूले, झूले कृष्ण मुरारी हैं,
झूले कृष्ण मुरारी हैं, जिनके संग राधा प्यारी हैं,
जिनके संग राधा प्यारी हैं, और ब्रज की साखिया सारी हैं,
राधे श्याम की जोड़ी सबको, देखो लगती प्यारी हैं,
राधा रानी झूला झूले, ओढ़े चुनर तारा री॥

सावन की तीजो का मेला, हर एक मन को भाया है,
हर एक मन को भाया है, भक्तों ने खूब सजाया है,
भक्तों ने खूब सजाया है, शर्मा दर्शन को आया है,
लख्खा भी झाँकी पे इनकी, देखो जाये बलिहारी,
राधा रानी झूला झूले, ओढ़े चुनर तारा री॥`,
    lyricsTransliteration: '',
    videoEmbedId: 'nbzUTUHW7BI',
    youtubeUrl: 'https://www.youtube.com/watch?v=nbzUTUHW7BI&list=RDnbzUTUHW7BI&start_radio=1&pp=ygU54KS24KWN4KSv4KS-4KSuIOCkneClguCksuClhyDgpLngpKjgpYHgpK7gpKQg4KSd4KWC4KSy4KWHoAcB',
  },
  {
    id: 29,
    slug: 'yaad-aai-hai-teri-yaad-aai-hai',
    title: 'Yaad Aai Hai Teri Yaad Aai Hai',
    titleHindi: 'याद आई है तेरी याद आई है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'viraha', 'devotional'],
    lyricsHindi: `याद आई है, तेरी याद आई है,
फेरु तेरी याद आई रे, खाटूवाला साँवरिया ॥

चारों तरफ तेरी चर्चा घनेरी,
मिलने की मनसा बड़ी श्याम मेरी,
सोई प्रीत जगाई रे, खाटूवाला साँवरिया ॥
फेरु तेरी याद आई रे......

मोहन निराली तुम्हारी छटा है,
इस दिल से पूछो तुम्हें क्या पता है,
कैसी आग लगाई रे, खाटूवाला साँवरिया ॥
फेरु तेरी याद आई रे......

पर्दा तुम्हें श्याम हटाना पड़ेगा,
वादा किया वो निभाना पड़ेगा,
राखी भोत समाई रे, खाटूवाला साँवरिया ॥
फेरु तेरी याद आई रे......

रोता हूँ मैं तू हँसे जा रहा है,
सीने को मेरे डसे जा रहा है,
होगी आज लड़ाई रे, खाटूवाला साँवरिया ॥
फेरु तेरी याद आई रे......

दीवानी आँखों मनाऊँ ना माने,
घायल की हालत तो घायल ही जाने,
'काशी' खूब निभाई रे, खाटूवाला साँवरिया ॥
फेरु तेरी याद आई रे......

श्रद्धेय स्व. काशीरामजी शर्मा द्वारा सुप्रसिद्ध भजन 'खाटू के बाबा श्यामजी, मेरी राखोगे लाज' की तर्ज पर रचित अनुपम – भावभरी – सर्वप्रिय रचना ।`,
    lyricsTransliteration: '',
    videoEmbedId: 'beKRhI_LYO0',
    youtubeUrl: 'https://www.youtube.com/watch?v=beKRhI_LYO0&list=RDbeKRhI_LYO0&start_radio=1&pp=ygVu4KSv4KS-4KSmIOCkhuCkiCDgpLngpYgg4KSk4KWH4KSw4KWAIOCkr-CkvuCkpiDgpIbgpIgg4KS54KWIIOCkluCkvuCkn-ClguCkteCkvuCksuCkviDgpLjgpL7gpIHgpLXgpLDgpL_gpK_gpL6gBwE%3D',
  },
  {
    id: 30,
    slug: 'aayega-aayega-aayega-leele-chad-sawara-aayega',
    title: 'Aayega Aayega Aayega Leele Chad Sawara Aayega',
    titleHindi: 'आएगा आएगा आएगा लीले चढ़ साँवरा आएगा',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'hope', 'devotional'],
    lyricsHindi: `आएगा आएगा आएगा,
लीले चढ़ साँवरा आएगा,
मेरा श्याम कृपालु है,
वो बड़ा दयालु है,
लाएगा लाएगा लाएगा,
खुशियाँ हजारों संग लाएगा,
आएगा आएगा आएगा,
लीले चढ़ साँवरा आएगा॥

तर्ज – आएगा आने वाला।

हारे का वही सहारा है,
वो सच्चा साथी हमारा है,
जो बन जाए माझी मेरा,
फिर दूर कहाँ किनारा है,
आएगा आएगा आएगा,
लीले चढ़ साँवरा आएगा,
लाएगा लाएगा लाएगा,
खुशियाँ हजारों संग लाएगा॥

इस बेदर्दी दुनिया में वो,
मेरा अपना बनकर आएगा,
मेरी सूनी बगिया है एक दिन,
माली बन फूल खिलाएगा,
आएगा आएगा आएगा,
लीले चढ़ साँवरा आएगा,
लाएगा लाएगा लाएगा,
खुशियाँ हजारों संग लाएगा॥

इस अंधियारे जीवन में तो,
मेरा श्याम उजाला लाएगा,
हारा 'निर्मल' जग वालों से,
वो श्याम सहारा आएगा,
आएगा आएगा आएगा,
लीले चढ़ साँवरा आएगा,
लाएगा लाएगा लाएगा,
खुशियाँ हजारों संग लाएगा॥`,
    lyricsTransliteration: '',
    videoEmbedId: 'aUJrbCyyLsc',
    youtubeUrl: 'https://www.youtube.com/watch?v=aUJrbCyyLsc&list=RDaUJrbCyyLsc&start_radio=1&pp=ygVd4KSG4KSP4KSX4KS-IOCkhuCkj-Ckl-CkviDgpIbgpI_gpJfgpL4g4KSy4KWA4KSy4KWHIOCkmuCkouCkvCDgpLjgpL7gpIHgpLXgpLDgpL4g4KSG4KSP4KSX4KS-oAcB',
  },
  {
    id: 31,
    slug: 'baithe-najdik-tu-sanware-ke-taar-se-taar-jugne-lagega',
    title: 'Baithe Najdik Tu Sanware Ke Taar Se Taar Jugne Lagega',
    titleHindi: 'बैठे नजदीक तु साँवरे के तार से तार जुगने लगेगा',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'meditative', 'satsang'],
    lyricsHindi: `बैठे नजदीक तु साँवरे के तार से तार जुगने लगेगा,
देख नजरो से नजरे मिला के तुमसे बातें ये करने लगेगा,

ये है भूखा तेरी भावना का प्यासा है तेरे प्रेम रस का,
नंगे पैरो ही दोहरा आता प्रेमियों का ऐसा इसे चसका
प्रेम जितना तू इससे बढ़ाये उतना तेरी तरफ ये बढ़ेगा,
देख नजरो से नजरे मिला के.....

पास में बैठ करके प्रभु को अपने दिल की हकीकत सुनाओ,
एक टक तुम शवि को निहारो कोई प्यारी सी धुन गुण गुनिओ,
भाव जा गयेगे तेरे हिरदय में प्रेम तेरा उमड़ने लगेगा,
देख नजरो से नजरे मिलाके......

होंगी आँखों ही आँखों में बातें खूब समझो गे इसके इशारे,
देगा निंदे से तुमको कनहिया बनके जाओ गे तुम इस के प्यारे,
इसके कहने में जब तुम चलो गे नाम दुनिया में तेरा चलेगा,
देख नजरो से नजरे मिलाके......

श्याम से प्यार जिसने किया है स्वाद जीवन का उसने लिया है,
जिसने नजदीकिय है बढ़ाई उसने मस्ती का प्याला पिया है,
बिनु होठों पर रख के देखो सारा जीवन महकने लगेगा,
देख नजरो से नजरे मिलाके.....`,
    lyricsTransliteration: '',
    videoEmbedId: 'FDK09-UQwnA',
    youtubeUrl: 'https://www.youtube.com/watch?v=FDK09-UQwnA&list=RDFDK09-UQwnA&start_radio=1&pp=ygV44KSs4KWI4KSg4KWHIOCkqOCknOCkpuClgOCklSDgpKTgpYEg4KS44KS-4KSB4KS14KSw4KWHIOCkleClhyDgpKTgpL7gpLAg4KS44KWHIOCkpOCkvuCksCDgpJzgpYHgpJfgpKjgpYcg4KSy4KSX4KWH4KSX4KS-oAcB',
  },
  {
    id: 32,
    slug: 'tere-dar-pe-aake-mujhe-kya-mila-hai',
    title: 'Tere Dar Pe Aake Mujhe Kya Mila Hai',
    titleHindi: 'तेरे दर पे आके मुझे क्या मिला है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'faith', 'devotional'],
    lyricsHindi: `तेरे दर पे आके मुझे क्या मिला है,
ये मैं जानता हूँ या तू जानता है

जमाने की चल घट बड़ी बे तुकी है,
जिधर देख ता हूँ मैं उधर सब दुखी है,
गिर के दुखों में भी मैं क्यों सुखी हूँ,
ये मैं जानता हूँ या तू जानता है

चेहरे पे चेहरे सभी हैं लगाये,
चोट गहरों से ज्यादा अपनों से खाये,
मुझे किस से कैसा शिकवा गिला है,
ये मैं जानता हूँ या तू जानता है

अकेला समज कर सताया जहाँ ने,
कदम दर दर मुझको रुलाया जहाँ ने.
कैसे हसी का ये कमल ये खिला है,
ये मैं जानता हूँ या तू जानता है

डूभे गई नैया कहती थी दुनिया,
पतन की उमीदों में रहती थी दुनिया,
नैया को कैसे किनारा मिला है,
ये मैं जानता हूँ या तू जानता है

अंदर घना था न दिखती थी राहें,
तूने सम्भाला मुझको फैला के बाहें,
नैनों को सजू कैसे उजाला मिला है,
ये मैं जानता हूँ या तू जानता है`,
    lyricsTransliteration: '',
    videoEmbedId: 'e2uWSGI_8BU',
    youtubeUrl: 'https://www.youtube.com/watch?v=e2uWSGI_8BU&list=RDe2uWSGI_8BU&start_radio=1&pp=ygVS4KSk4KWH4KSw4KWHIOCkpuCksCDgpKrgpYcg4KSG4KSV4KWHIOCkruClgeCkneClhyDgpJXgpY3gpK_gpL4g4KSu4KS_4KSy4KS-IOCkueCliKAHAQ%3D%3D',
  },
  {
    id: 33,
    slug: 'saawariya-main-dekhu-ri-mujhe-shyam',
    title: 'Saawariya Main Dekhu Ri Mujhe Shyam',
    titleHindi: 'सांवरिया मैं देखूँ री मुझे श्याम',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['krishna', 'bansuri', 'darshan'],
    lyricsHindi: `निरखू श्रीजी सांवरा,
दरशन लीजे बनवारी,
जब चाहूँ दरशन करूँ,
गुरु सुख सांवरा.....

सांवरिया मैं देखूँ री मुझे श्याम,
श्याम श्यामी दातार,
गाय ग्वाल के साथ री सांवरिया,
बाँसी लखदातार,
बाँसुरी बजी बधावे रे,
संकट का बाँसुरी जीवन में,
आजो जी रे,
मेरा मन मोह बढ़ावे रे,
तेरे साथ में खेलो सांवरिया
मेरी ग्वालनी रे.....

मिरगछी हाथों में,
सोहनी बाँसी धर घुमावे,
देख के मोहे लगावो बाँसी,
जाजी झिलमिली झरे,
मेरी झिलमिली झरावे रे,
केशर को बाँसी मोहक आजा भी,
दिया लखावे रे,
बाँसी मुरली नहीं जावे रे,
तेरे साथ में खेलो सांवरिया
मेरी ग्वालनी रे.....

बाँसी पे फुलवारी जगावे,
श्याम रंगीला गायो रे,
रंग रंग में रंगी बाँसुरी,
ठाकुर मिल गायो रे,
जनम जनम मिलनो जावे रे,
बाँसी मुरली छोटी बाँसी,
सांवरिया मैं जावे रे,
मैं तन मन बढ़ावे रे,
तेरे साथ में खेलो सांवरिया
मेरी ग्वालनी रे.....

धरम धाम के संगारिया,
धरमगत मिले रे,
लखी श्यामक नगरी तेरो,
हर मुरली गीत रे,
मेरे मन बसियो जावे रे,
देख देख तेरा श्याम सुरतियो,
गाय लखावे रे,
बाँसी की मीठी आवे रे,
तेरे साथ में खेलो सांवरिया
मेरी ग्वालनी रे.....

सांवरिया मैं देखूँ री मुझे श्याम,
श्याम श्यामी दातार,
गाय ग्वाल के साथ री सांवरिया,
बाँसी लखदातार,
बाँसुरी बजी बधावे रे,
संकट का बाँसुरी जीवन में,
आजो जी रे,
मेरा मन मोह बढ़ावे रे,
तेरे साथ में खेलो सांवरिया
मेरी ग्वालनी रे.....`,
    lyricsTransliteration: '',
  },
  {
    id: 34,
    slug: 'meri-jo-laj-hai-shyam-tere-haath-hai',
    title: 'Meri Jo Laj Hai Shyam Tere Haath Hai',
    titleHindi: 'मेरी जो लाज है श्याम तेरे हाथ है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'prayer', 'faith'],
    lyricsHindi: `मेरी जो लाज है श्याम तेरे हाथ है
दुनिया गरीब की बस ये फरियाद है
मेरी जो लाज है श्याम तेरे हाथ है

आँखी तूफान आए नैया हिलकोरे खाए
तेरे भरोसे बैठा हूँ नैया न डूब जाए
अँधेरी रात है ना कोई साथ है
दुनिया गरीब की बस ये फरियाद है

हम तो कमजोर हैं तेरा ही जोर है
दुनिया में तेरे सिवा कोई ना और है
बिगड़े हालात है गम की बरसात है
दुनिया गरीब की बस ये फरियाद है

लाज बचाने वाले तेरी शरण में आया
वापस न जाऊँगा दिल में सोचके आया
हम तो अनाथ हैं तू तो दीननाथ है
दुनिया गरीब की बस ये फरियाद है

माँगू एक भीख तुमसे तेरा सहारा दे
बनवारी टूटी नैया इसका किनारा दे
यह छोटी सी बात है सब तेरे हाथ है
दुनिया गरीब की बस ये फरियाद है

मेरी जो लाज है श्याम तेरे हाथ है
दुनिया गरीब की बस ये फरियाद है`,
    lyricsTransliteration: '',
  },
  {
    id: 35,
    slug: 'sewak-ko-apne-saawre-yu-na',
    title: 'Sewak Ko Apne Saawre Yu Na',
    titleHindi: 'सेवक को अपने साँवरे यूँ ना',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['krishna', 'darshan', 'prayer'],
    lyricsHindi: `सेवक को अपने साँवरे यूँ ना सताइये,
पलक बिछाए राह तकें आ भी जाइये,
सेवक को अपने साँवरे यूँ ना...

नज़रों को इंतज़ार है तेरे दीदार का,
बाहें भुला रही प्रभु प्यासा हूँ प्यार का,
दौलत पे थोड़ी प्यार की हम पर लुटाइये,
सेवक को अपने साँवरे यूँ ना...

मीरा के प्यार को प्रभु सम्मान दे दिया,
देखे सुदामा की तरह सुख दान दे दिया,
मेरे भी काहे साँवरे अब तो मिलाइये,
सेवक को अपने साँवरे यूँ ना.......

क्या देखते हो सामने कुछ भी न खास है,
निचे ज़रा निहारिये चरणों में दास है,
सौंप दे कर कर्म ज़रा नज़रें मिलाइये,
सेवक को अपने साँवरे यूँ ना.......`,
    lyricsTransliteration: '',
  },
  {
    id: 36,
    slug: 'araj-suno-mere-saawariya',
    title: 'Araj Suno Mere Saawariya',
    titleHindi: 'अरज सुनो मेरे साँवरिया',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['krishna', 'prayer', 'bhajan'],
    lyricsHindi: `अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया,
अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया ॥

क्या यूँ ही हमें तड़पाओगे,
बाबा बंद हमें दर्श दिखाओगे,
नेता ही गए बाँवरिया,
हमने सहारा तेरा लिया,
अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया ॥

जब गज ने तुमको पुकारा था,
तुमने जल में प्राण को मारा था,
गज ने तेरा नाम लिया,
हमने सहारा तेरा लिया,
अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया ॥

जब द्रौपदी तुमको टेरी थी,
तुमने एक पल ना टेरी की,
तू फिर मैं आकर सभा गया,
हमने सहारा तेरा लिया,
अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया ॥

ये दास कहैंयो तेरा है,
मेरा तेरे भरोसे डेरा है,
तुमने सबका पूरण काम किया,
हमने सहारा तेरा लिया,
अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया ॥

अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया,
हमने सहारा तेरा लिया,
हमने सहारा तेरा लिया,
अरज सुनो मेरे साँवरिया,
हमने सहारा तेरा लिया ॥`,
    lyricsTransliteration: '',
  },
  {
    id: 37,
    slug: 'kitna-ajeeb-mohan-kismat-ka-lekh-mera',
    title: 'Kitna Ajeeb Mohan Kismat Ka Lekh Mera',
    titleHindi: 'कितना अजीब मोहन किस्मत का लेख मेरा',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['mohan', 'krishna', 'devotional'],
    lyricsHindi: `कितना अजीब मोहन किस्मत का लेख मेरा,
जो कुछ भी हो रहा है उसमें हाथ तेरा,
कितना अजीब मोहन किस्मत का लेख मेरा,

हारे थे हारते थे का हारते रहे गए,
खामोश है कन्हैया कुछ भी न कहे गए,
किस से कहूँ है मोहन कोई न जग में मेरा,
कितना अजीब मोहन किस्मत का लेख मेरा,

हँसते खाते खाते सहना तुमसे ही सिखा,
अब तो लगे है हारना जुआ भी ज़िंदगी का,
दुःख में भी सुख है मोहन कैसा है खेल तेरा,
कितना अजीब मोहन किस्मत का लेख मेरा,

किस्मत जो तुमसे यारी जीना सफल हुआ है,
बदनाम नाम ना हो मेरी तो ये दुआ है,
कितने चला वो जूँ ओ छोड़े न साथ तेरा,
कितना अजीब मोहन किस्मत का लेख मेरा`,
    lyricsTransliteration: '',
  },
  {
    id: 38,
    slug: 'bharose-hum-to-baba-ke',
    title: 'Bharose Hum To Baba Ke',
    titleHindi: 'भरोसे हम तो बाबा के',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'faith', 'baba'],
    lyricsHindi: `भरोसे हम तो बाबा के,
जो होगा देखा जाएगा......

वो हारे का सहारा,
सबलोना प्यारा प्यारा,
गरीबों का गुजारा,
चलाने वाला वो,
संभालेगा वो ही आखे,
जो होगा देखा जाएगा,
भरोसे हम तो बाबा के,
जो होगा देखा जाएगा......

वो बाँधे में बुलाए,
या चरणों लगाए,
हँसाए या रुलाए,
के चाहे जो भी हो,
वो जाने किस तरह रखे,
जो होगा देखा जाएगा,
भरोसे हम तो बाबा के,
जो होगा देखा जाएगा......

हमारा यहाँ क्या है,
उसी का तो दिया है,
दुनिया दुनिया है,
उसी का दिल तो,
पड़े है हम शरण बाबा के,
जो होगा देखा जाएगा,
भरोसे हम तो बाबा के,
जो होगा देखा जाएगा..........

मिलेंगे बिछड़े भी,
कटेंगे झगड़े भी,
बढ़ेंगे उम्रें भी,
बसाएगा भी वो,
फिर फिर 'लखी' करे कहाँ,
जो होगा देखा जाएगा,
भरोसे हम तो बाबा के,
जो होगा देखा जाएगा......`,
    lyricsTransliteration: '',
  },
  {
    id: 39,
    slug: 'kab-loge-shyam-kab-loge',
    title: 'Kab Loge Shyam Kab Loge',
    titleHindi: 'कब लोगे श्याम कब लोगे',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'prayer', 'devotional'],
    lyricsHindi: `कब लोगे श्याम कब लोगे,
श्याम खजानाबंध धारी हमारी सुध कब लोगे,
दीनन के हितकारी हमारी सुध कब लोगे,
कब लोगे श्याम कब लोगे,

मीरा दासी को अपनाया साथ ने लखा हार बनाया,
गोवर्धन गिरधारी हमारी सुध कब लोगे,
श्याम खजानाबंध धारी हमारी सुध कब लोगे,

खंभ फोड़ प्रह्लाद उबारा हिरणाकुश का उद्धर विदारा,
जागो लीलाधारी हमारी सुध कब लोगे,
श्याम खजानाबंध धारी हमारी सुध कब लोगे,

धीरज की सीमा नहीं टूटे आशा का संबल न छूटे,
अब बसल बनवारी हमारी सुध कब लोगे,
श्याम खजानाबंध धारी हमारी सुध कब लोगे,

श्याम बहादुर बेठा छाओ दया सिंहु हो दया दिखाओ,
शिव ने अर्ज गुजारी हमारी सुध कब लोगे,
श्याम खजानाबंध धारी हमारी सुध कब लोगे,`,
    lyricsTransliteration: '',
  },
  {
    id: 40,
    slug: 'hai-shyam-khaja-bandhari',
    title: 'Hai Shyam Khaja Bandhari',
    titleHindi: 'है श्याम खजा बंधारी',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'baba', 'devotional'],
    lyricsHindi: `है श्याम खजा बंधारी,
तुम ही सुनते हो हमारी,
जब कोई ना आए आवे,
देख भगत की हार जिताने,
तू लीजे चढ़कर आवे,
है श्याम खजा बंधारी,
तुम ही सुनते हो हमारी...

भीगी पलकें देख भगत की,
चैन ना तुमको आता,
पीछने आँसू छूट तू अपने,
लीजे को दौड़ता, दौड़ता, दौड़ता,
बदला के आँसू गम के खुशी में,
रोते को तू हँसाए,
देख भगत की हार जिताने,
तू लीजे चढ़कर आवे,
है श्याम खजा बंधारी,
तुम ही सुनते हो हमारी...

समय के साथ बदलते देखी,
हमने दुनिया सारी,
मैंने तेरा जग जाना ना जाना`,
    lyricsTransliteration: '',
  },
  {
    id: 41,
    slug: 'jab-koi-na-aave-go-duniya-me-thare-kaam',
    title: 'Jab Koi Na Aave Go Duniya Me Thare Kaam',
    titleHindi: 'जब कोई ना आवे गो दुनिया में थारे काम',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'rajasthani', 'faith'],
    lyricsHindi: `साँवरियो आवे आवे गो,
जब कोई ना आवे गो दुनिया में थारे काम,
साँवरियो काम बनावे गो,

भटक भटक जाद हार तू जावे,
बनाता काम भी बिगाड़ो जावे,
सुना जो श्याम ने तू हिवड़े रे री बात,
महारा श्याम धनी है लीजे तू असवार,
झट नीचे चढ़ के आवे गो,
जब कोई ना आवे गो दुनिया में थारे काम,
साँवरियो काम बनावे गो,

श्याम जीतावे हारी बाजी श्याम,
श्याम भगत की गाई गाजी,
भगत कोई दिल बीतावे है,
ये मोरे छड़ी को धारी बाबा श्याम भगत ने आये हँसावे है,
जब कोई ना आवे गो दुनिया में थारे काम,
साँवरियो काम बनावे गो,

श्याम का दर पे हाँवे सुनाई,
बस थोड़ी सी एठे कर लो सुनाई,
लागी हो कितनी ही भीड़ अपार,
तू श्याम पे करले आँख मीच के विश्वास,
श्याम निश्चित आवे गो,
जब कोई ना आवे गो दुनिया में थारे काम,
साँवरियो काम बनावे गो,`,
    lyricsTransliteration: '',
  },
  {
    id: 42,
    slug: 'patli-si-patang-bhari-mein-siya',
    title: 'Patli Si Patang Bhari Mein Siya',
    titleHindi: 'पतली सी पतंग भारी में सिया',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'rajasthani', 'seva'],
    lyricsHindi: `श्याम महारे धरा ले चालू रे,
पतली सी पतंग भारी में सिया मरेली रे,
श्याम महारे धरा .....

ठंडी ठंडी बाल चालूसी, शर शर काँपे काया,
खाटू वाले खाटू में सिया मरेली भाया,
थारा दांत कड़कड़ बोले रे,
पतली सी पतंग भारी में सिया.....

महारे धरा छ गुड़रा भाया जाके सो सो कारी,
एक आँध सया एक बिजलासाया, रात काटखा सारी,
कथा नाके नाके ढोले रे
पतली सी पतंग भारी में सिया.....

माखन मिश्री तने चाये, बाग पड़ी है खोटी,
महारे धरा है बाजरा की रूखी सूखी रोटी,
गुड़ को दधियो सागे ले ले रे
पतली सी पतंग भारी में सिया.....

आव आव तू बाँगो आजा, पकड़ अंगली महारी,
सुंदर मरता शर शर काँपा, झाट जोहता थारी,
बाबा महारे सागे होले रे,
पतली सी पतंग भारी में सिया.....

हरदम थारी सेवा करूं, नित उठ भोग लगाऊं,
धूप दिये नैवेद्य सजाकर रोज आरती गाऊं,
सेवक चरणा चित झोले रे
पतली सी पतंग भारी में सिया.....`,
    lyricsTransliteration: '',
  },
  {
    id: 43,
    slug: 'bhola-taawariya-ne-bhulaya-kadiya-sarsari-re',
    title: 'Bhola Taawariya Ne Bhulaya Kadiya Sarsari Re',
    titleHindi: 'भोला तावरिया ने भुलाया कड़िया सरसरी रे',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'rajasthani', 'bhakt'],
    lyricsHindi: `तेरा भक्त करे तने याद श्याम,
तने आजो पड़सी रे,
भोला तावरिया ने भुलाया,
कड़िया सरसी रे,
कड़िया सरसी रे साँवरा,
कड़िया सरसी रे,
भोला तावरिया ने भुलाया,
कड़िया सरसी रे।

जद जद मार आफत आवे,
नाम तेरो ही भावे,
और कोई दुख बाँटे नाही,
तू ना देर लगावे,
मा आफत मुकी भी भाया,
मा आफत मुकी भी भाया,
टाला सरसी रे,
भोला तावरिया ने भुलाया,
कड़िया सरसी रे।

भागी जगह से निगाह करी,
सुनी सब याही बतलावे,
खाटू वालो श्याम धनी,
तेरी नैया पार लगावे,
हो लीजे अवसर तने को,
आजो पड़सी रे,
भोला तावरिया ने भुलाया,
कड़िया सरसी रे।

झगड़ा झगड़ा झोले नैया,
सूझे नहीं किनारो,
श्याम धनी तेरे भगता ने,
तेरी एक सहारो,
दास शरण छे थारे दाता,
राखो पड़सी रे,
भोला तावरिया ने भुलाया,
कड़िया सरसी रे।`,
    lyricsTransliteration: '',
  },
  {
    id: 44,
    slug: 'parivar-mera-tere-hawale-khatuwale',
    title: 'Parivar Mera Tere Hawale Khatuwale',
    titleHindi: 'परिवार मेरा तेरे हवाले खाटूवाले',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'family', 'prayer'],
    lyricsHindi: `परिवार मेरा तेरे हवाले खाटुवाले,

चलना साथ साथ बाबा मेरी राहों में,
अगर गिर में जाऊं कहीं उठा ले न बाहों में,
तेरे सिवा मुझको कौन संभाले खाटुवाले
हो खाटुवाले.....

मुझे डर है केवल संसार का,
क्योंकि हमारे सिर पर भोज परिवार का,
थोड़ा भोज मेरा तू भी उठा ले खाटुवाले
हो खाटुवाले.....

तू तो हारे का सहारा मेरा श्याम है एक में एकेला बेबस और
लाखों काम है,
ज़रा हाथ आकर मेरा बटा ले खाटुवाले हो खाटुवाले,`,
    lyricsTransliteration: '',
  },
  {
    id: 45,
    slug: 'pata-kuch-nahi-hai-kahan-ja-raha-hoon',
    title: 'Pata Kuch Nahi Hai Kahan Ja Raha Hoon',
    titleHindi: 'पता कुछ नहीं है कहाँ जा रहा हूँ',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'viraha', 'devotional'],
    lyricsHindi: `पता कुछ नहीं है कहाँ जा रहा हूँ
कहाँ जा रहा हूँ
तू ले जा रहा है वहीं जा रहा हूँ
वहीं जा रहा हूँ
पता कुछ नहीं है कहाँ जा रहा हूँ
कहाँ जा रहा हूँ

तू अँधेरे की लाठी पता चेपता का,
मैं पल पल कहा हूँ अपनी खता का,
कहाँ से कहाँ ढोकर खा रहा हूँ,
ढोकर खा रहा हूँ,
पता कुछ नहीं है कहाँ जा रहा हूँ
कहाँ जा रहा हूँ

कदम जो तेरे आशियाने में रखा,
मजा खुद में तेरी तलफत का चखा,
फिर भी कहा फिर भी ये ना रहा हूँ,
फिर भी ये ना रहा हूँ,
पता कुछ नहीं है कहाँ जा रहा हूँ
कहाँ जा रहा हूँ

तुम्हारे लिए मैंने छोड़ जमाना,
मगर तुम भी करने लगे हो बहाना,
मैं किनके की जैसे बहा जा रहा हूँ,
बहा जा रहा हूँ,
पता कुछ नहीं है कहाँ जा रहा हूँ
कहाँ जा रहा हूँ

सुनी 'श्याम बहादुर' कहता रीत का,
ना पहचान पाया 'शिव' तेरी नीत का,
कितना दिलरुबा का सता जा रहा हूँ,
सता जा रहा हूँ,
पता कुछ नहीं है कहाँ जा रहा हूँ
कहाँ जा रहा हूँ`,
    lyricsTransliteration: '',
  },
  {
    id: 46,
    slug: 'kadam-kadam-par-raksha-karta',
    title: 'Kadam Kadam Par Raksha Karta',
    titleHindi: 'कदम कदम पर रक्षा करता',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'protection', 'devotional'],
    lyricsHindi: `खाटू वाला खाटू वाला ओ लीजे घोड़े वाला,
कदम कदम पर रक्षा करता, घर घर करे उजाला, उजाला,
खाटू वाला खाटू वाला ओ लीजे घोड़े वाला.....

मन मंदिर के बास करो तुम दूर करो अँधियारा,
पापों का मेरे नाश करो तुम, बन कर के रखवारा, रखवारा,
खाटू वाला खाटू वाला ओ लीजे घोड़े वाला.....

जब जब भीड़ पड़ी भक्तन पर, उनको विपदा ताली,
सच्चे मन से जो भी पुकारे, प्रगटे दीनदयाला, दयाला,
खाटू वाला खाटू वाला ओ लीजे घोड़े वाला.....

नेम नियम से जो कोई खावे मन को मुराद पावे,
निछड़े साथी फिर से मिला कर, घर घर प्रेम बढ़ाया, बढ़ाया,
खाटू वाला खाटू वाला ओ लीजे घोड़े वाला.....

भीम सेन के पोत्र नाहटे अहिल्यावती के लाला,
पांडव कुल सरदार श्याम जी, जपूँ निहारी माला, हो माला,
खाटू वाला खाटू वाला ओ लीजे घोड़े वाला.....`,
    lyricsTransliteration: '',
  },
  {
    id: 47,
    slug: 'mann-pareshan-hai-dil-bhi-hairan-hai',
    title: 'Mann Pareshan Hai Dil Bhi Hairan Hai',
    titleHindi: 'मन परेशान है दिल भी हैरान है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'prayer', 'sankat'],
    lyricsHindi: `मन परेशान है दिल भी हैरान है,
हालत जा रहा तू कहाँ श्याम है,
चलते चलते प्रभु आ गया मैं कहाँ,
कुछ खबर ही नहीं कुछ नहीं जान है,
मन परेशान है दिल भी हैरान है,
हालत जा रहा तू कहाँ श्याम है।

है कहीं ये श्याम दूर मंजिल बड़ी,
ना तो है राहगुज़र मुश्किलें भी खड़ी,
मुश्किलें भी खड़ी,
कहीं मोड़ों पे भी तेरा नाम है,
हालत जा रहा तू कहाँ श्याम है,
चलते चलते प्रभु आ गया मैं कहाँ,
कुछ खबर ही नहीं कुछ नहीं जान है,
मन परेशान है दिल भी हैरान है,
हालत जा रहा तू कहाँ श्याम है।

मेरे जैसे मेरे अनेक हैं बहुत,
खुद भी लो ना प्रभु तुमसे कुछ कह रहे,
तुमसे कुछ कह रहे,
अँधियों में खुदा मेरा बेगान है,
हालत जा रहा तू कहाँ श्याम है,
चलते चलते प्रभु आ गया मैं कहाँ,
कुछ खबर ही नहीं कुछ नहीं जान है,
मन परेशान है दिल भी हैरान है,
हालत जा रहा तू कहाँ श्याम है।

अब समय आ गया मेरे संकट हरो,
जख्म जो भी मेरे श्याम तू ही भरो,
श्याम तू ही भरो,
तेरे 'निर्मल' का बस तू निगेहबान है,
हालत जा रहा तू कहाँ श्याम है,
चलते चलते प्रभु आ गया मैं कहाँ,
कुछ खबर ही नहीं कुछ नहीं जान है,
मन परेशान है दिल भी हैरान है,
हालत जा रहा तू कहाँ श्याम है।`,
    lyricsTransliteration: '',
  },
  {
    id: 48,
    slug: 'jo-pandav-kule-avatar-kadi-badli-hai',
    title: 'Jo Pandav Kule Avatar Kadi Badli Hai',
    titleHindi: 'जो पांडव कुल अवतार कड़ी बदली है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'pandav', 'devotional'],
    lyricsHindi: `जो पांडव कुल अवतार,
बड़ो अलबेला है,
करले करूण पुकार,
सीप दे नैया भी पतवार,
बड़ो अलबेला है,
जो पांडव कुल अवतार,
बड़ो अलबेला है।

घुड़ चाला बाल श्याम का,
मीर मुखड़ मनमोहनी,
शरणागत की रक्षा करता,
श्याम छाया छायावनी,
मेले लागे चार श्याम को,
है मोटी दरबार,
बड़ो अलबेला है,
जो पांडव कुल अवतार,
बड़ो अलबेला है।

मोटा मोटा नैया श्याम का,
जपूँ भगत का प्याला,
दिल का दरिया ये मनमीत,
मंगल करने वाला है,
साथे नहीं उधार मेरे यो,
साँवरियों सरकार,
बड़ो अलबेला है,
जो पांडव कुल अवतार,
बड़ो अलबेला है।

'श्याम बहादुर' सदा सलूनी,
शिव रसियों सैलानी,
तुरता फुरती काम पड़ावे,
देखो भाव पुरानी है,
खूब सजायो श्रृंगार तेरे यो,
नैया का खेवन हार,
बड़ो अलबेला है,
जो पांडव कुल अवतार,
बड़ो अलबेला है।`,
    lyricsTransliteration: '',
  },
  {
    id: 49,
    slug: 'morchadi-laharaye-re-rasiya-o-saawara',
    title: 'Morchadi Laharaye Re Rasiya O Saawara',
    titleHindi: 'मोरछड़ी लहराए रे रसिया ओ साँवरा',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'morchadi', 'devotional'],
    lyricsHindi: `मोरछड़ी लहराए रे, रसिया ओ साँवरा
तेरी बहुत बड़ी सकलाई रे। ओ साँवरा

मोरछड़ी का जादू निराला,
इसकी धूमि है खाटू वाला।
नीले चढ़के दौड़ा ये आए,
सारे संकट पल में मिटाए।
रसिया ओ साँवरा, तेरी बहुत बड़ी सकलाई रे
मोरछड़ी ...

श्याम बहादुर दर्शन को आए,
ताले मंदिर के बंद पाए।
मोरछड़ी से तालों को खोला
शीश झुका कर बाबा से बोला।
रसिया ओ साँवरा, तेरी बहुत बड़ी सकलाई रे
मोरछड़ी ...

मोरछड़ी की महिमा है भारी
श्याम धनी को लागे ये प्यारी
दुख कहे रोतों को हँसाए
हाथों में जब तेरे लहराए
रसिया ओ साँवरा, तेरी बहुत बड़ी सकलाई रे
मोरछड़ी ...`,
    lyricsTransliteration: '',
  },
  {
    id: 50,
    slug: 'dani-hokar-tu-chup-betha',
    title: 'Dani Hokar Tu Chup Betha',
    titleHindi: 'दानी होकर तू चुप बैठा',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'baba', 'prayer'],
    lyricsHindi: `श्याम बाबा श्याम बाबा श्याम बाबा,
दानी हो कर तू चुप बैठा ये कैसी दातारी रे,
ओ श्याम बाबा क्यों तेरे भक्त दुखियारी रे,
श्याम बाबा श्याम बाबा श्याम बाबा...

श्याम सुंदर ने खुश हो कर तुझे अपना रूप दिया है,
और हमने उस रूप का दर्शन सौ सौ बार किया है,
हमारे संकट दूर न हो तो ये बदनामी थारी रे,
ओ श्याम बाबा क्यों तेरे भक्त दुखियारी रे.....

न मैं चाहूँ हीरे मोती ना चाँदी ना सोना,
मेरे अंगन भेज दे बाबा तुमसे एक सहोना,
हम को क्या जो बन उपवन में फूल रही पुलवारी रे,
ओ श्याम बाबा क्यों तेरे भक्त दुखियारी रे.....

जब तक आशा पूरी ना होगी दर से हम ना हटेंगे,
सब भक्तों को बुलका देंगे तेरा नाम ही लेंगे,
सौंप ले तू भगतों का पलड़ा सदा रहा भारी रे,
ओ श्याम बाबा क्यों तेरे भक्त दुखियारी रे.....`,
    lyricsTransliteration: '',
  },
  {
    id: 51,
    slug: 'sajne-ka-hai-shaukeen',
    title: 'Sajne Ka Hai Shaukeen',
    titleHindi: 'सजने का है शौकीन',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'shringar', 'darbar'],
    lyricsHindi: `सजने का है शौकीन,कोई कसार न रह जाए
ऐसा कर दो श्रृंगार,सब देखते रह जाए
सजने का है शौकीन...........

जब साँवरा सजता है,सारी दुनिया सजती है
बाबा पे इतर छिड़कते हैं,सारी दुनिया महकती है
बागों का हर एक फूल,गजरे में लग जाए
सजने का है शौकीन...........

जब कान्हा मुस्काए,मीरा भी चटक जाए,
चंदा भी दर्शन को,धरती पे उतर आए
सूरज की किरणों से,दरबार चमक जाए
सजने का है शौकीन...........

क्या उसको सजाओगे,जो सबको सजाता है
क्या उसको खिलाओगे,जो सबको खिलाता है
बस भाव के सागर में,मेरा श्याम समा जाए
सजने का है शौकीन...........

बस इतना ध्यान रखना,इतना ना साज जाए
इस सारी सृष्टि को,उसे नज़र ना लग जाए
ये सुभान रूपम तेरे,भाव के भजन गाए
सजने का है शौकीन...........`,
    lyricsTransliteration: '',
  },
  {
    id: 52,
    slug: 'aaj-brij-mein-holi-re-rasiya',
    title: 'Aaj Brij Mein Holi Re Rasiya',
    titleHindi: 'आज ब्रिज में होली रे रसिया',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['holi', 'krishna', 'brij'],
    lyricsHindi: `आज ब्रिज में होली रे रसिया।
होली रे रसिया, बरजोरी रे रसिया।

अपने अपने घर से निकसी,
कोई श्यामल कोई गोरी रे रसिया।

कोन गाँव के कूँवर कन्हैया,
कोन गाँव राधा गोरी रे रसिया।

नन्द गाँव के कूँवर कन्हैया,
बरसाने की राधा गोरी रे रसिया।

कोन वरज के कूँवर कन्हैया,
कोन वरज राधा गोरी रे रसिया।

श्याम वरज के कूँवर कन्हैया प्यारे,
गीर वरज राधा गोरी रे रसिया।

इत ते आए कूँवर कन्हैया,
उत ते राधा गोरी रे रसिया।

कोन के हाथ कनक पिचकारी,
कोन के हाथ कमोरी रे रसिया।

कृष्ण के हाथ कनक पिचकारी,
राधा के हाथ कमोरी रे रसिया।

उड़त गुलाल लाल भये बादल,
मारत भर भर झोरी रे रसिया।

अबीर गुलाल के बादल छाए,
धूम मचाई रे सब मिल रसिया।

चन्द सखी भज बोल कृष्ण होवे,
निर जीवे यह जोड़ी रे रसिया।`,
    lyricsTransliteration: '',
  },
  {
    id: 53,
    slug: 'ai-khatu-wale-shyam-main-tera-ho-gaya',
    title: 'Ai Khatu Vale Shyam Main Tera Ho Gaya',
    titleHindi: 'ऐ खाटू वाले श्याम मैं तेरा हो गया',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'bhakti', 'devotional'],
    lyricsHindi: `जब से देखा तुम्हें, जाने क्या हो गया,
ऐ खाटू वाले श्याम मैं तेरा हो गया ।

तू दाता है तेरा पुजारी हूँ मैं,
तेरे दर का ऐ बाबा भिखारी हूँ मैं ।
तेरी चौखट पे दिल है मेरा खो गया,
ऐ मुरली वाले श्याम मैं तेरा हो गया ॥

जब से मुझको ऐ श्याम तेरी भक्ति मिली,
मेरे मुरझाए मन में हैं कलिया खिली ।
जो ना सोचा कभी था वही हो गया,
ऐ खाटू वाले श्याम मैं तेरा हो गया ॥

तेरे दरबार की वाह अजब शान है,
जो भी देखे वो ही तुझपे कुर्बान है ।
तेरी भक्ति का मुझको नशा हो गया,
ऐ खाटू वाले श्याम मैं तेरा हो गया ॥

'शर्मा' जब तेरी झांकी का दर्शन किया,
तेरे चरणों में तन मन यह अर्पण किया ।
इक दफा तेरी नगरी में जो भी गया,
ऐ मुरली वाले श्याम मैं तेरा हो गया ॥`,
    lyricsTransliteration: '',
  },
  {
    id: 54,
    slug: 'kaliyug-mein-siddh-ho-dev-tumhi-hanuman',
    title: 'Kaliyug Mein Siddh Ho Dev Tumhi Hanuman Tumhara Kya Kehna',
    titleHindi: 'कलयुग में सिद्ध हो देव तुम्हीं हनुमान तुम्हारा क्या कहना',
    deityId: 3,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['hanuman', 'bhakti', 'stuti'],
    lyricsHindi: `कलयुग में सिद्ध हो देव तुम्हीं हनुमान तुम्हारा क्या कहना ।
तेरी शक्ति का क्या कहना, तेरी भक्ति का क्या कहना

1 सीता की खोज करी तुमने, तुम सात समुंदर पार गये।
लंका को किया शमशान प्रभु, बलवान तुम्हारा क्या कहना ।
तेरी शक्ति का क्या कहना, तेरी भक्ति का क्या कहना

2 जब लखन लाल को शक्ति लगी तुम घोलगिर पर्वत लाये,
लक्ष्मण के बचाये आ कर के तब प्राण तुम्हारा क्या कहना,
तेरी शक्ति का क्या कहना, तेरी भक्ति का क्या कहना

3 तुम भक्त शिरोमणी हो जग में तुम वीर शिरोमणी हो जग में,
तेरे रोम रोम में बसते हैं सिया राम तुम्हारा क्या कहना`,
    lyricsTransliteration: '',
  },
  {
    id: 55,
    slug: 'holi-aai-holi-aai-masti-lai',
    title: 'Holi Ai Holi Ai Masti Lai',
    titleHindi: 'होली आई होली आई मस्ती लाई',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['holi', 'krishna', 'festival'],
    lyricsHindi: `होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥

तर्ज – बोलो सारा रता।

अलौक – होली में चारों तरफ,
छाई अजब उमंग,
जगह जगह ढोलक बजते,
और बजे रे संग,
राधे रानी श्याम के मुख पे,
मले रे गुलाल,
भर पिचकारी मार दे,
राधा को गोपाल।

होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई,
रंग लेके खेलते,
गुलाल लेके खेलते,
राधा संग होली,
नंदलाल खेलते,
बोलो सारा रता,
सारा राता मदन गोपाल खेलते,
बोलो सारा रता, जय हो,
होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥

"ढोलक मजीरा और,
भंग लेके नाचते।" – २
सखियों और सारे,
स्याल बाल खेलते,
बोलो सारा रता,
सारा राता मदन गोपाल खेलते,
बोलो सारा रता, जय हो,
होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥

"भर पिचकारी मारे,
राधा को कन्हैया।" – २
सुखदे पे मन के,
गुलाल खेलते,
बोलो सारा रता,
सारा राता मदन गोपाल खेलते,
बोलो सारा रता, जय हो,
होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥

"राधा जी गुलाल मले,
श्याम जी के मुख पे।" – २
सारे आज होके,
लाल लाल खेलते,
बोलो सारा रता,
सारा राता मदन गोपाल खेलते,
बोलो सारा रता, जय हो,
होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥

"देवता भी होली यही,
खेलने को आते हैं।" – २
झूला झियों बाबा,
भोलानाथ खेलते,
बोलो सारा रता,
सारा राता मदन गोपाल खेलते,
बोलो सारा रता, जय हो,
होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥

"धामी खाटू धाम की तो,
महिमा निराली है।" – २
भक्त यहाँ होली,
हर साल खेलते,
बोलो सारा रता,
सारा राता मदन गोपाल खेलते,
बोलो सारा रता, जय हो,
होली आई होली आई होली आई,
मस्ती लाई मस्ती लाई॥`,
    lyricsTransliteration: '',
  },
  {
    id: 56,
    slug: 'shyam-shri-shyam-shri-shyam-jay-jay-shyam',
    title: 'Shyam Shri Shyam Shri Shyam Jay Jay Shyam',
    titleHindi: 'श्याम श्री श्याम श्री श्याम जय जय श्याम',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'jaap', 'stuti'],
    lyricsHindi: `श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥

तर्ज – मंगल भवन अमंगलहारी।

नंद के नंदन गोवर्धन धारी,
करहु कृपा प्रभु कृष्ण मुरारी।
श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥

जय जशोमति के कुवर कन्हैया,
द्रौपदी के तुम लाज बचईया।
श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥

त्रास निवारक भय भंवहारी,
दुष्ट दलन संतन हितकारी।
श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥

अर्जुन को गीता पढ़ाए,
दुर्योधन का मान घटाए।
श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥

मोर मुकुट पीतांबर धारी,
शोभा बरणि ना जाए तुम्हारी।
श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥

दोहा – दान शीश का तुम ना देते अगर,
दरबार तेरा ये पावन यूँ सजता नहीं,
और हारों के सहारे ना बनते अगर,
तेरी चौखट पे यूँ मेला लगता नहीं।

श्याम श्री श्याम,
श्री श्याम जय जय श्याम॥`,
    lyricsTransliteration: '',
  },
  {
    id: 57,
    slug: 'aao-aao-savariya-baiga-aao-ji-moji-bhog-lagao',
    title: 'Aao Aao Savariya Baiga Aao Ji Moji Bhog Lagao',
    titleHindi: 'आओ आओ सावरिया बैगा आओ जी मोजी भोग लगाओ',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'bhog', 'seva'],
    lyricsHindi: `मीठी है नमकीन है बाबा चरपरो थोड़े खाटे
सोने की थाली में परोसियो झाल चांदी को बाटे
ठाबरिया मनोहर करे बाबा देखू थे कहिया नाटे
भोग लगाओ श्याम धनी रे थारा बाकी भक्त ने बांटे

आओ आओ सावरिया बैगा आओ, जी मोजी भोग लगाओ,
है छपन भोग तैयार जी, थारा ठाबरिया करे मनुहार जी,

कैसरिया बरफी कलाकंद रबड़ी पेड़ा इमरती बालूशाही,
लड्डू बूंदिया जलेबी रसगुल्ला गाजर पाक रसमलाई,
गुलाब जामुन शकरपारा घेवर न्यारा न्यारा,
जिमन आओ ना तोरा और घलबो,
है छपन भोग तैयार जी,
थारा ठाबरिया करे मनोहार जी...

दाल मोठ पकोड़ी कचोरी भुजिया पापड़ चिवड़े
कढ़ी राबड़ी साग सांगरी को बाजरे का बाबा खीचड़ो,
रायता में जीरा को तड़को पीओ मार सबरको,
साग काचरे की चटनी चटाओ जिमो जीब हांग लगाओ,
है छपन भोग तैयार जी,
थारा ठाबरिया करे मनोहार जी,

काजू किसमीस नोजा खुरमानी खोप्रा चुवारा बादाम लेआओ,
जिम जूठ और आचमन करके फिर थोरी आराम लेवो,
साँफ एलाइची हाजिर कर दी सागे मिशरी धर दी,
सोई नागरिया पान चवाबो जिमो जी भोग लगाओ,
है छपन भोग तैयार जी,
थारा ठाबरिया करे मनोहार जी,

आम अमरूद अंगूर अनानास आलू बुखारा अनार धरिया,
केला सेब पपीता चिकू संतरा मौसमी रसधार धरिया,
काकड़िया रे लाल मतिरा तर टमाटर खीरा
नीबू खाटे थोड़े चिढ़काओ जिमो जी भोग लगाओ,
है छपन भोग तैयार जी,
थारा ठाबरिया करे मनोहार जी,

छपन भोग परोसिया तारे भागता श्याम धनी स्वीकार करो,
सरल बावलो महिमा गावे अन्न धन से भंडार भरो,
लिली थारी सब जाग जानी थे हो शीश का दानी,
बिगड़ी लखखा की थे हो तो बनाओ जिमो जी भोग लगाओ,
है छपन भोग तैयार जी,
थारा ठाबरिया करे मनोहार जी,`,
    lyricsTransliteration: '',
  },
  {
    id: 58,
    slug: 'mere-shyam-ki-haveli',
    title: 'Mere Shyam Ki Haweli',
    titleHindi: 'मेरे श्याम की हवेली',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'haveli', 'darshan'],
    lyricsHindi: `मेरे श्याम की हवेली बड़ी सुंदर अलबेली
बनवाई है कन्हैया चितचोर चोर ने,
बैठे श्याम प्रभु दिलवाले, देखो कैसे ठाठ निराले
बनवाई है कन्हैया चितचोर ने

मकराने की बनी हवेली दोनो और दीवारी,
गोपीनाथ विराजे दाएं बाएं है त्रिपुरारी,
रे शिखर ध्वजा लहरावे प्यारी,
हो ढौड़ी पर हनुमान विराजे, कर रया रे रखवारी
मेरे श्याम की......

सोने को सिंहासन देखो छत्र लटके न्यारो,
हीरा मोती मानक जड़या लागे प्यारो प्यारो,
रे जया पे बिराजे म्हारो खाटू वालो
भक्त हिलावे पंखा खड़या, डोरी रेशम वाली।
मेरे श्याम की......

रे हेली के पिछवाड़े देखो फूला री फुलवारी,
गेंहू चना बाजरा की है खेती न्यारी न्यारी,
हो लहराती देखो हर डाली,
वीरे गाजर मूली और पपीता खेतों में हरियाली।
मेरे श्याम की ......`,
    lyricsTransliteration: '',
  },
  {
    id: 59,
    slug: 'shri-ram-janaki-baithe-hain-mere-sine-mein',
    title: 'Shri Ram Janaki Baith Hain Mere Sine Mein',
    titleHindi: 'श्री राम जानकी बैठे हैं मेरे सीने में',
    deityId: 4,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['rama', 'hanuman', 'bhakti'],
    lyricsHindi: `नहीं चलाओ बाण व्यंग के ऐह विभीषण
ताना ना सैह पाऊं, क्यों तोड़ी है यह माला,
तुझे ऐ लंकापति बतलाऊं
मुझ में भी है तुझ में भी है, सब में है समझाऊं
ऐ लंका पति विभीषण ले देख मैं तुझ को आज दिखाऊं

- जय श्री राम -

श्री राम जानकी बैठे हैं मेरे सीने में,
देख लो मेरे मन के नगिने में ।

मुझ को कीर्ति न वैभव न यश चाहिए,
राम के नाम का मुझ को रस चाहिए ।
सुख मिले ऐसे अमृत को पीने में,
श्री राम जानकी बैठे हैं मेरे सीने में ॥

अनमोल कोई भी चीज मेरे काम की नहीं
दिखती अगर उसमें छवि सिया राम की नहीं

राम रसिया हूँ मैं, राम सुमिरन करूं,
सिया राम का सदा ही मैं चिंतन करूं ।
सच्चा आनंद है ऐसे जीने में श्री राम,
श्री राम जानकी बैठे हैं मेरे सीने में ॥

फाड़ सीना है सब को यह दिखला दिया,
भक्ति में हैं मस्ती बेधड़क दिखला दिया ।
कोई मस्ती ना सागर मीने में,
श्री राम जानकी बैठे हैं मेरे सीने में ॥`,
    lyricsTransliteration: '',
  },
  {
    id: 60,
    slug: 'are-dwarpalon-kehna-se-keh-do',
    title: 'Are DwarPalo Kehna Se Keh Do',
    titleHindi: 'अरे द्वारपालों कहना से कह दो',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['krishna', 'sudama', 'darshan'],
    lyricsHindi: `देखो देखो यह गरीबी, यह गरीबी का हाल,
कृष्ण के दर पे यह विश्वास ले के आया हूँ ।
मेरे बचपन का दोस्त है यह श्याम,
यही सोच कर मैं आस ले कर के आया हूँ ॥

अरे द्वारपालों कहना से कह दो,
दर पे सुदामा गरीब आ गया है ।
भटकते भटकते ना जाने कहाँ से,
तुम्हारे महल के करीब आ गया है ॥

ना सर पे है पगड़ी, ना तन पे है जामा
बतादो कन्हैया को नाम है सुदामा ।
इक बार मोहन से जाकर के कहदो,
मिलने सखा बदनसीब आ गया है ॥

सुनते ही दौड़े चले आये मोहन,
लगाया गले से सुदामा को मोहन ।
हुआ रुकमणी को बहुत ही अचंभा,
यह मेहमान कैसा अजीब आ गया है ॥`,
    lyricsTransliteration: '',
  },
  {
    id: 61,
    slug: 'agar-kismat-se-ai-mere-shyam-tera-deedar-ho-jaye',
    title: 'Agar Kismat Se Ai Mere Shyam Tera Deedar Ho Jaye',
    titleHindi: 'अगर किस्मत से ऐ मेरे श्याम तेरा दीदार हो जाए',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'deedar', 'prayer'],
    lyricsHindi: `अगर किस्मत से ऐ मेरे श्याम,
तेरा दीदार हो जाए,
तो ये 'लखखा' चरण में आपके,
बलिहार हो जाए,
तो ये सेवक चरण में आपके,
बाबा बलिहार हो जाए॥

तर्ज – अगर दिलबर की रूसवाई।

सुना है अपने भक्तों की,
तुम्हीं इज्जत बचाते हो,
कठिन से भी कठिन संकट,
को खाटू वाले हटाते हो,
दया की इक नजर मुझ पर,
भी अब दातार हो जाए,
तो ये बालक चरण में आपके,
बाबा बलिहार हो जाए॥

दया की दृष्टि ऐ मेरे श्याम,
अगर हम पर भी उठा दो तुम,
जो अपनी प्रेम की बंसी,
का बस अमृत पीला दो तुम,
तो सूखे बाग दिल के फिर,
गुले गुलजार हो जाए,
तो ये सेवक चरण में आपके,
बाबा बलिहार हो जाए॥

हमारे पास कुछ युक्ति नहीं,
तुमको रिझाने की,
न कोई चीज है ऐसी,
प्रभु सेवा में लाने की,
नजर इक बार कर दो तो,
ये बेड़ा पार हो जाए,
तो ये सेवक चरण में आपके,
बाबा बलिहार हो जाए॥

भला है या बुरा लखखा,
मगर बालक तुम्हारा है,
तुम्हारे ही चरण रज का,
इस 'शर्मा' को सहारा है,
अगर विनती ये खाटूवाले को,
स्वीकार हो जाए,
तो ये बालक चरण में आपके,
बाबा बलिहार हो जाए॥`,
    lyricsTransliteration: '',
  },
  {
    id: 62,
    slug: 'shyam-ke-charnon-mein-hardam',
    title: 'Shyam Ke Charnon Mein Hardam',
    titleHindi: 'श्याम के चरणों में हरदम',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'charan', 'bhakti'],
    lyricsHindi: `श्याम के चरणो में हरदम लगी मेरी हाजरी रहती
मेरी आशा उम्मीदों की सदा बगिया हरी रहती

भटकने दर बदर मुझ को नहीं मेरा साँवरा देता
मैं लख दातार का नौकर मैं लख दातार का चाकर ।

मेरी पूजा खरी सबसे खरा घनश्याम है मेरा ।
मेरी चाहत खरी सबस मेरी नियत खरी रहती ।

पुकारूं जब कन्हैया को खिवया बनके आजाए ।
भले तूफान हो भारी मेरी नय्या तरी रहती ।

रहै एहसास ये मुझ को श्याम मेरे आसपास ही है ।
गूंजती कानों में लखखा इनकी बाँसुरी रहती ।`,
    lyricsTransliteration: '',
  },
  {
    id: 63,
    slug: 'dildar-kanhaiya-ne-mujhko-apnaya-hai',
    title: 'Dildar Kanhaiya Ne Mujhko Apnaya Hai',
    titleHindi: 'दिलदार कन्हैया ने मुझको अपनाया है',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['krishna', 'prem', 'devotional'],
    lyricsHindi: `तर्ज – बचपन की मोहब्बत को

दिलदार कन्हैया ने,
मुझको अपनाया है,
रस्ते से उठा करके,
सीने से लगाया है.....

ना कर्म ही अच्छे थे,
ना भाग्य प्रबल मेरा,
ना सेवा करी तेरी,
ना नाम कभी तेरा,
ये तेरा बड़प्पन है,
मुझे प्रेम सिखाया है,
रस्ते से उठा करके,
सीने से लगाया है.....

जो कुछ हूँ आज प्रभु
सब तेरी मेहरबानी,
शत शत है नमन तुझको,
महाभारत के दानी,
तूने ही दया करके,
जीवन महकाया है,
रस्ते से उठा करके,
सीने से लगाया है.....

प्रभु रखना संभाल मेरी,
ये मन ना भटक जाए,
बस इतना ध्यान रहे,
कोई दाग ना लग जाए,
बदरंग ना हो जाए,
जो रंग चढ़ाया है,
रस्ते से उठा करके,
सीने से लगाया है.....

अहसास है ये मुझको,
चरणों में सुरक्षित हूँ
अहसान बहुत तेरे,
भूले ना कभी 'बिंदू',
श्री श्याम सुधामृत का,
स्वाद चखाया है,
रस्ते से उठा करके,
सीने से लगाया है.....`,
    lyricsTransliteration: '',
  },
  {
    id: 64,
    slug: 'mere-dildar-baba-sun-padi-majhdhar-mein-naiya',
    title: 'Mere Dildar Baba Sun Padi Majhdhar Mein Naiya',
    titleHindi: 'मेरे दिलदार बाबा सुन पड़ी मझधार में नैया',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'nayya', 'prayer'],
    lyricsHindi: `मेरे दिलदार बाबा सुन,
पड़ी मझधार में नैया,
उठा पतवार आके,
उठा पतवार आके॥

मैं हूँ बाबा बहुत दुखारी,
आया हूँ मैं शरण तुम्हारी,
दरश करादे श्याम मुरारी,
तुम्हारा नाम सुनकर के,
तुम्हारे पास आया हूँ,
सहारा दे दो आकर के॥

है मेरे मालिक देना सहारा,
छोड़ ना देना दामन तुम्हारा,
नाम तुम्हारा प्राणों से प्यारा,
लगन तेरी लगी दिल में,
तुम्हारा नाम जपता हूँ,
लगा दो पार आकर के॥

कबसे पुकारूं सुनता नहीं है,
तेरे सिवाय मेरा कोई नहीं है,
'बनवारी' तुझ बिन कुछ भी नहीं है,
नहीं कोई सहारा है,
मगन रहता हूँ फिर भी मैं,
तुम्हारे गीत गाकर के॥`,
    lyricsTransliteration: '',
  },
  {
    id: 65,
    slug: 'baba-tumsa-dayalu-dev-dooja-nahin-hai',
    title: 'Baba Tumasa Dayalu Dev Duja Nahin Hai',
    titleHindi: 'बाबा तुमसा दयालु देव दूजा नहीं है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'dayalu', 'bhakti'],
    lyricsHindi: `बाबा तुमसा दयालु,
देव दूजा नहीं है,
बदल देता तू किस्मत,
बात झूठी नहीं है,
बाबा तुमसा दयालु।

तर्ज – चांद आए भरेगा।

लोग कहते हैं बाबा,
द्वार तेरा निराला,
शरण जो तेरी आया,
उसको तुमने सम्भाला,
देवता इस जहाँ में,
कोई तुमसा नहीं है,
बदल देता तू किस्मत,
बात झूठी नहीं है,
बाबा तुमसा दयालु॥

क्या ये दरबार तेरा,
पहले जैसा नहीं है,
क्या तू दीनों के खातिर,
देव वैसा नहीं है,
टूटी उम्मीद मेरी,
नाव टूटी हुई है,
बदल देता तू किस्मत,
बात झूठी नहीं है,
बाबा तुमसा दयालु॥

हमारा काम होगा,
तुम्हारा नाम होगा,
अगर डूबेगी नैया,
नाम बदनाम होगा,
हमारा काम होगा,
तुम्हारा नाम होगा,
अगर तारोगे नैया,
नाम सरनाम होगा,
कहता 'बनवारी' जो भी,
बात बिलकुल सही है,
बदल देता तू किस्मत,
बात झूठी नहीं है,
बाबा तुमसा दयालु॥`,
    lyricsTransliteration: '',
  },
  {
    id: 66,
    slug: 'hare-ke-sahare-aaja-tera-das-pukare-aaja',
    title: 'Hare Ke Sahare Aaja Tera Das Pukare Aaja',
    titleHindi: 'हारे के सहारे आजा तेरा दास पुकारे आजा',
    deityId: 2,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['shiva', 'bhairavnath', 'prayer'],
    lyricsHindi: `हारे के सहारे आजा, तेरा दास पुकारे आजा,
हम तो खड़े तेरे द्वार, सुन ले करुण पुकार,
हारे के सहारे आजा, आओ ना आओ ना..

कोई सुनता नहीं, मैं सुनाऊं किसे, ये बता,
दर्द दिल का भला मैं दिखाऊं किसे, ये बता ।
तेरे होते मेरी हार, कैसे होगी सरकार,
भैरुनाथ, एक बार तू धीर बंधाजा ॥
हम तो खड़े तेरे द्वार, सुन ले करुण पुकार,
हारे के सहारे आजा...

लाख चाहूँ मगर, बात बनती नहीं, क्या करूं,
नाव भटके मेरी, पार लगती नहीं, क्या करूं ।
कैसे नैया होगी पार, टूट गई पतवार,
भैरुनाथ, अब हाथ तू आके लगाजा ॥
हम तो खड़े तेरे द्वार, सुन ले करुण पुकार,
हारे के सहारे आजा...

हैं भरोसा तेरा, अब सहारा तेरा भैरुजी,
तेरे चरणों में है, अब गुजारा मेरा भैरुजी ।
सबकी यही है पुकार, आके भक्तों को संभाल,
भैरुनाथ, आके मूल छवि दिखलाजा ॥
हम तो खड़े तेरे द्वार, सुन ले करुण पुकार,
हारे के सहारे आजा...`,
    lyricsTransliteration: '',
  },
  {
    id: 67,
    slug: 'sanwara-jab-mere-sath-hai',
    title: 'Sanwara Jab Mere Sath Hai',
    titleHindi: 'सांवरा जब मेरे साथ है',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'faith', 'sahara'],
    lyricsHindi: `सांवरा जब मेरे साथ है,
हमको डरने की क्या बात है ।
इसके रहते कोई कुछ कहे,
बोलो किसकी यह औकात है ॥

छाए काली घटाए तो क्या,
इसकी छतरी के नीचे हूँ मैं ।
आगे आगे यह चलता मेरे,
मेरे मालिक के पीछे हम मैं ।
इसने पकड़ा मेरा हाथ है,
मुझको डरने की क्या बात है ॥

इसकी महिमा का वर्णन करूं,
मेरी वाणी में वो दम नहीं ।
जब से इसका सहारा मिला
फिर सताए कोई गम नहीं ।
बाबा करता करामत है
हमको डरने की क्या बात है ॥

क्यों मैं भटकूं यहाँ से वहाँ
इसके चरणों में है बैठना ।
झूठे स्वार्थ के रिश्ते सभी,
कहना से है रिश्ता बना ।
ये करता मुलाकात है,
हमको डरने की क्या बात है ॥

जहाँ आनंद की लगती झड़ी,
ऐसी महफिल सजता है ये ।
'बिंदू' क्यों ना दीवाना बने,
ऐसे जल्वे दिखता है ये ।
दिल चुराने में विक्यात है,
हमको डरने की क्या बात है ॥`,
    lyricsTransliteration: '',
  },
  {
    id: 68,
    slug: 'dekhu-jidhar-udhar-hi-mere-shyam-ka-najara',
    title: 'Dekhu Jidhar Udhar Hi Mere Shyam Ka Najara',
    titleHindi: 'देखू जिधर उधर ही मेरे श्याम का नजारा',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'darshan', 'khatu-dham'],
    lyricsHindi: `देखू जिधर उधर ही मेरे श्याम का नजारा,
खाटू का श्याम बाबा लगता है सबको प्यारा,
बोलो बोलो जय श्री श्याम बोलो जय खाटू धाम,

इस दर पे जो भी आया अरदास है लगाया,
झोली फैलाके अपनी दुःख दर्द है सुनाया,
उसको मिला भरोसा हर लेता कष्ट सारा,
देखू जिधर उधर ही मेरे श्याम का नजारा,

किस्मत का खेल भाई क्या कोई जान लेगा,
हैं भुलंदी पे सितारा कब टूट के गिरे गा,
गिरे को धमता है चमका दे फिर सितारा,
देखू जिधर उधर ही मेरे श्याम का नजारा,

विश्वास है ये दिल का वो साथी है हमारा,
हम प्रेमी साँवरे के सौभाग्य ये हमारा,
हर शाम प्रेमी बोलो वो हारे का सहारा,
देखू जिधर उधर ही मेरे श्याम का नजारा,

जो मांगो गे मिले गा अर्जी लगा के देखो,
इक बार साँवरे के दर पे तो आके देखो,
मिलता है डूबते को यहाँ तिनके का सहारा,
देखू जिधर उधर ही मेरे श्याम का नजारा,`,
    lyricsTransliteration: '',
  },
  {
    id: 69,
    slug: 'mere-yaar-bansuri-vale',
    title: 'Mere Yaar Bansuri Vale',
    titleHindi: 'मेरे यार बांसुरी वाले',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'bansuri', 'devotional'],
    lyricsHindi: `मेरे यार बांसुरी वाले दिल दार बांसुरी वाले,
तेरी यादा कर के हार गयो,
चाकर ये सेवक सेवक ये सेवक राले,
तेरे मस्त नजारो मार गयो,

नटनागर नंद किशोर सुनो जरा मीरा के चितचोर सुनो,
नैन से नैन मिला ले तू है के चिलम गुजार गयो,
मेरे यार बांसुरी वाले दिलदार बांसुरी वाले,
तेरी यादा कर के हार गयो,

खाटू मंदिर में वास तेरो मैं भी सेवक खास तेरो,
मने चरना से लिपटले तू कई वर दाता ताल गयो,
मेरे यार बांसुरी वाले दिलदार बांसुरी वाले,
तेरी यादा कर के हार गयो,

विपदा में आड़ो आवे सू बिगड़ी में मेरी बनावे तू
हिवड़े से श्याम लगा ले तेरो चीर कालजो पार गयो,
मेरे यार बांसुरी वाले दिलदार बांसुरी वाले,
तेरी यादा कर के हार गयो,

शिव श्याम बहादुर आ जायो धरती को दर्द मिटा जाओ,
मिल मिल के रंग जमा ले मेरा बिगड़ा काज सवार देयो,
मेरे यार बांसुरी वाले दिलदार बांसुरी वाले,
तेरी यादा कर के हार गयो,`,
    lyricsTransliteration: '',
  },
  {
    id: 70,
    slug: 'kyun-bhool-gaye-shyama',
    title: 'Kyun Bhool Gaye Shyama',
    titleHindi: 'क्यूं भूल गए श्यामा',
    deityId: 1,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['krishna', 'shyama', 'bhakti'],
    lyricsHindi: `क्यूं भूल गए श्यामा, मुझे पागल समझ कर भूल गए,
पागल समझ कर भूल गए ,श्याम पागल समझ कर भूल गए,
क्यूं भूल गए श्यामा.....

मेरे मन में उठी तरंगे , जापलू नाम तुम्हारा
अब श्यामा तुम दर्शन दे दो ,होगा भला तुम्हारा,
हम बालक है नादानर तुम क्यूं कर भूल गए
क्यूं भूल गए श्यामा.....

तुम आओ या ना आओ,मैं लूंगा नाम तुम्हारा,
जहाँ कहीं भी जाओगे, पीछा करूं तुम्हारा
मैं छोड़ नहीं सकता, तुम बेशक हमको छोड़ चले
क्यूं भूल गए श्यामा.....

दुनिया में तुम भगति की माला जल्दी फेरो भगवन ,
नहीं तो इस दुनिया में श्यामा धरम होएगा भंग,
क्यूं तोड़ रहे श्यामा मेरा भगति भरा दिल तोड़ रहे
क्यूं भूल गए श्यामा.....

मेरे मन में आश लगी मैं आया पास तुम्हारे,
मातुदत है तुम बिन व्याकुल ,सुनले नंद दुलारे,
मैं भूल नहीं सकता तुम बेशक हमको भूल चले
क्यूं भूल गए श्यामा.....`,
    lyricsTransliteration: '',
  },
  {
    id: 71,
    slug: 'malik-mharo-sanwariyo',
    title: 'Malik Mharo Sanwariyo',
    titleHindi: 'मालिक म्हारो सांवरियो',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'rajasthani', 'sevak'],
    lyricsHindi: `मालिक म्हारो साँवरियो,
बण गयो मैं तो चाकरियो,
चाकरियो चाकरियो,
साँवरिया को चाकरियो,
मालिक म्हारो साँवरियो,
बण गयो मैं तो चाकरियो......

जद से फिराई मोरछड़ी,
विपदा घर से दूर खड़ी,
गाड़ी म्हारी हांकणियो,
बण गयो मैं तो चाकरियो,
मालिक म्हारो साँवरियो,
बण गयो मैं तो चाकरियो......

कलिकाल को महाबली,
चर्चा एंकी की गली गली,
खाली ना जावे मांगणियो,
बण गयो मैं तो चाकरियो,
मालिक म्हारो साँवरियो,
बण गयो मैं तो चाकरियो......

अटल छत्र तेरी माया,
पार नहीं कोई पाया,
जीत गया है हारणियो,
बण गयो मैं तो चाकरियो,
मालिक म्हारो साँवरियो,
बण गयो मैं तो चाकरियो......

बिन बोले सब करयो,
सेवा पाकर के तरयो,
श्याम के जैसो गावणियो,
बण गयो मैं तो चाकरियो,
मालिक म्हारो साँवरियो,
बण गयो मैं तो चाकरियो.....`,
    lyricsTransliteration: '',
  },
  {
    id: 72,
    slug: 'bar-bar-main-tumhe-pukarun-sun-lo-lakhdatar',
    title: 'Bar Bar Main Tumhe Pukarun Sun Lo Lakhdatar',
    titleHindi: 'बार बार मैं तुम्हें पुकारूं सुन लो लखदातार',
    deityId: 9,
    singerName: 'Traditional',
    composerName: 'Traditional',
    playCount: 0,
    rating: 0,
    featured: false,
    tags: ['khatu-shyam', 'lakhdatar', 'nayya'],
    lyricsHindi: `बार बार मैं तुम्हें पुकारूं,
सुन लो लखदातार,
नैया हमारी श्याम,
आके लगा दो पार,
बार बार मैं तुम्हें पुकारूं,
सुन लो लखदातार,
नैया हमारी श्याम,
आके लगा दो पार......

सुना है मैंने नाम,
बड़े तुम दानी हो,
ऐसा सुंदर रूप,
बड़े तुम शानी हो,
तन कैसरिया बागो सोहे,
कैसा है सिंगार,
नैया हमारी श्याम,
आके लगादो पार,
नैया हमारी श्याम,
आके लगा दो पार......

अहलवती के लाल,
माया तेरी न्यारी है,
पूरो मन की आस,
भरोसो भारी है,
अंध विच नैया डूब रही है,
पार करो करतार,
नैया हमारी श्याम,
आके लगादो पार,
नैया हमारी श्याम,
आके लगा दो पार......

आलू सिंह जी भक्त,
बड़े तपधारी है,
चरण नवावे शीश,
ये दुनिया सारी है,
कैसर तिलक लगावे,
धारे करे अजब श्रृंगार,
नैया हमारी श्याम,
आके लगादो पार,
नैया हमारी श्याम,
आके लगा दो पार......

बंसी धर कर जोड़,
शीश नवावे है,
तेरी कृपा श्रीश्याम,
यो हर दम चावे है,
चरण कमल को,
लियो आसरो,
तेरा ही आधार,
नैया हमारी श्याम,
आके लगादो पार,
नैया हमारी श्याम,
आके लगा दो पार......`,
    lyricsTransliteration: '',
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
