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
