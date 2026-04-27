/**
 * Bhajan Knowledge Base - Q&A Database
 * Comprehensive information about deities, bhajans, singers, and spiritual guidance
 * Used by Kirtan AI to answer questions beyond simple bhajan search
 */

export interface KnowledgeItem {
  id: string;
  question: string;
  questionHindi?: string;
  answer: string;
  answerHindi: string;
  category: 'deity' | 'meaning' | 'singer' | 'practice' | 'benefits' | 'technical';
  tags: string[];
  relatedBhajanKeywords?: string[];
  confidence?: number; // 0-1 for semantic matching
}

export const BHAJAN_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // ========== DEITY QUESTIONS ==========
  {
    id: 'deity_krishna',
    question: 'Who is Krishna?',
    questionHindi: 'कृष्ण कौन हैं?',
    answer: 'Krishna is one of the most beloved deities in Hinduism. He is the eighth avatar of Lord Vishnu, known as the Supreme Being in the Bhagavad Gita. Krishna is revered for his divine love, compassion, and wisdom. He is often depicted playing the flute (murali) and is the charioteer in the great battle of Kurukshetra.',
    answerHindi: 'कृष्ण हिंदू धर्म में सबसे प्रिय देवताओं में से एक हैं। वे भगवान विष्णु के आठवें अवतार हैं। कृष्ण को उनके दिव्य प्रेम, करुणा और ज्ञान के लिए पूजा जाता है। उन्हें अक्सर बांसुरी बजाते हुए दिखाया जाता है और वे कुरुक्षेत्र की महान लड़ाई में सारथी थे।',
    category: 'deity',
    tags: ['krishna', 'deity', 'avatar', 'vishnu'],
    relatedBhajanKeywords: ['krishna', 'हरे कृष्ण', 'हरि', 'मुरारी']
  },
  {
    id: 'deity_shiva',
    question: 'Tell me about Lord Shiva',
    questionHindi: 'भगवान शिव के बारे में बताएं',
    answer: 'Shiva is one of the principal deities of Hinduism, part of the Trinity (Trimurti) alongside Brahma and Vishnu. Shiva is the god of meditation, yoga, and cosmic destruction that leads to rebirth. He is often depicted meditating in the Himalayas, adorned with a crescent moon, serpents, and a third eye. His sacred mantra is "Om Namah Shivaya".',
    answerHindi: 'शिव हिंदू धर्म के प्रमुख देवताओं में से एक हैं। शिव ध्यान, योग और ब्रह्मांडीय विनाश के देवता हैं जो पुनर्जन्म की ओर ले जाता है। उन्हें अक्सर हिमालय में ध्यान करते हुए दिखाया जाता है। उनका पवित्र मंत्र "ॐ नमः शिवाय" है।',
    category: 'deity',
    tags: ['shiva', 'deity', 'meditation', 'trinity'],
    relatedBhajanKeywords: ['शिव', 'महादेव', 'नीलकंठ', 'om namah shivaya']
  },
  {
    id: 'deity_hanuman',
    question: 'Who is Hanuman?',
    questionHindi: 'हनुमान कौन हैं?',
    answer: 'Hanuman is a revered deity symbolizing courage, strength, and unwavering devotion. He is the monkey god who served Lord Rama with absolute loyalty in the Ramayana. Hanuman is considered the ultimate devotee (bhakta) and is worshipped for his power, bravery, and protection. His mantra is "Hanuman Chalisa".',
    answerHindi: 'हनुमान साहस, शक्ति और अटूट भक्ति का प्रतीक हैं। वह बंदर देवता हैं जिन्होंने रामायण में भगवान राम की पूरी निष्ठा के साथ सेवा की। हनुमान को अंतिम भक्त माना जाता है और शक्ति, वीरता और सुरक्षा के लिए पूजा जाता है।',
    category: 'deity',
    tags: ['hanuman', 'deity', 'devotion', 'strength', 'rama'],
    relatedBhajanKeywords: ['हनुमान', 'हनुमान चालीसा', 'संकट', 'बजरंग']
  },
  {
    id: 'deity_durga',
    question: 'Who is Durga?',
    questionHindi: 'दुर्गा कौन हैं?',
    answer: 'Durga is the supreme goddess representing divine feminine power (Shakti). She is the warrior goddess who defeated the buffalo demon Mahishasura. Durga is worshipped for her strength, protection, and victory over evil. She embodies the divine mother and is celebrated during Navratri festival.',
    answerHindi: 'दुर्गा दिव्य स्त्री शक्ति (शक्ति) का प्रतिनिधित्व करती हैं। वह योद्धा देवी हैं जिन्होंने महिषासुर नामक भैंस राक्षस को हराया। दुर्गा को शक्ति, सुरक्षा और बुराई पर विजय के लिए पूजा जाता है। वह नवरात्रि त्योहार के दौरान मनाई जाती हैं।',
    category: 'deity',
    tags: ['durga', 'goddess', 'shakti', 'power', 'female'],
    relatedBhajanKeywords: ['दुर्गा', 'माता', 'शक्ति', 'नवरात्रि']
  },
  {
    id: 'deity_ganesha',
    question: 'Who is Ganesha?',
    questionHindi: 'गणेश कौन हैं?',
    answer: 'Ganesha is the elephant-headed god of wisdom, intellect, and new beginnings. He is worshipped before starting any auspicious activity or ritual. Ganesha removes obstacles (Vighnaharta) and is the patron of arts and sciences. His mantra is "Om Gam Ganapataye Namaha".',
    answerHindi: 'गणेश ज्ञान, बुद्धि और नई शुरुआत के हाथी-सिर वाले देवता हैं। किसी भी शुभ कार्य या अनुष्ठान से पहले उनकी पूजा की जाती है। गणेश बाधाओं को दूर करते हैं और कला और विज्ञान के संरक्षक हैं।',
    category: 'deity',
    tags: ['ganesha', 'ganesh', 'wisdom', 'beginnings', 'obstacles'],
    relatedBhajanKeywords: ['गणेश', 'गणपति', 'विघ्नहर्ता', 'मोदक']
  },

  // ========== MANTRA & MEANING QUESTIONS ==========
  {
    id: 'meaning_hare_krishna',
    question: 'What does "Hare Krishna" mean?',
    questionHindi: '"हरे कृष्ण" का क्या मतलब है?',
    answer: '"Hare Krishna" is a sacred mantra found in Hindu scriptures. "Hare" refers to the energy of the Supreme Lord (Radha), and "Krishna" is the Supreme Being. Together, it means "Oh Lord, please engage me in Your service." This mantra is chanted to connect with divine consciousness and seek spiritual liberation.',
    answerHindi: '"हरे कृष्ण" एक पवित्र मंत्र है। "हरे" का मतलब भगवान की ऊर्जा (राधा) है, और "कृष्ण" सर्वोच्च सत्ता हैं। एक साथ, इसका अर्थ है "हे प्रभु, मुझे अपनी सेवा में लगाएं"। इस मंत्र का जाप दिव्य चेतना से जुड़ने और आध्यात्मिक मुक्ति की मांग करने के लिए किया जाता है।',
    category: 'meaning',
    tags: ['hare krishna', 'mantra', 'meaning', 'krishna', 'liberation'],
    relatedBhajanKeywords: ['हरे कृष्ण', 'mahamantra', 'मंत्र']
  },
  {
    id: 'meaning_om',
    question: 'What does "Om" represent?',
    questionHindi: '"ॐ" का क्या प्रतिनिधित्व है?',
    answer: '"Om" (ॐ) is the primordial sound and most sacred mantra in Hinduism and yoga. It represents the universe, the Brahman (ultimate reality), and the three states of consciousness - waking, dreaming, and deep sleep. Chanting "Om" is believed to align your mind with cosmic vibrations and promote inner peace.',
    answerHindi: '"ॐ" प्राचीन ध्वनि और हिंदू धर्म में सबसे पवित्र मंत्र है। यह ब्रह्मांड, ब्रह्मन (सर्वोच्च वास्तविकता) का प्रतिनिधित्व करता है। "ॐ" का जाप आपके मन को ब्रह्मांडीय कंपन के साथ संरेखित करने के लिए माना जाता है।',
    category: 'meaning',
    tags: ['om', 'mantra', 'sound', 'cosmic'],
    relatedBhajanKeywords: ['om', 'ॐ', 'aum']
  },

  // ========== PRACTICE GUIDANCE ==========
  {
    id: 'practice_singing',
    question: 'How should I sing bhajans?',
    questionHindi: 'मुझे भजन कैसे गाने चाहिए?',
    answer: 'Bhajans are best sung with devotion and focus. Here are tips: 1) Sing with pure intention and love for the divine. 2) Focus on the meaning of the lyrics, not just the words. 3) Start slowly and gradually increase pace if comfortable. 4) Sing in a group for better spiritual experience. 5) Regular practice improves both voice and devotion. 6) Early morning (Brahma Muhurta) is the best time.',
    answerHindi: 'भजन भक्ति और ध्यान के साथ सबसे अच्छे से गाए जाते हैं। यहाँ सुझाव हैं: 1) शुद्ध इरादे और दिव्य के प्रति प्रेम के साथ गाएं। 2) शब्दों के अर्थ पर ध्यान दें। 3) धीरे शुरू करें और धीरे-धीरे गति बढ़ाएं। 4) समूह में गाने से बेहतर आध्यात्मिक अनुभव मिलता है। 5) नियमित अभ्यास आवाज़ और भक्ति दोनों को बेहतर बनाता है।',
    category: 'practice',
    tags: ['singing', 'devotion', 'technique', 'bhajan'],
    relatedBhajanKeywords: ['भजन', 'गीत', 'गाना']
  },
  {
    id: 'practice_best_time',
    question: 'What is the best time to chant or sing bhajans?',
    questionHindi: 'भजन गाने का सबसे अच्छा समय क्या है?',
    answer: 'Early morning (around 4-6 AM, known as Brahma Muhurta) is considered the most auspicious time for spiritual practices including bhajan singing. This is when the mind is fresh, the surroundings are quiet, and spiritual energy is at its peak. However, you can sing bhajans anytime with sincere devotion.',
    answerHindi: 'सुबह जल्दी (ब्रह्म मुहूर्त के रूप में जानी जाने वाली 4-6 बजे) आध्यात्मिक प्रथाओं के लिए सबसे शुभ समय माना जाता है। इस समय मन ताज़ा होता है और आध्यात्मिक ऊर्जा अपने शिखर पर होती है। लेकिन आप किसी भी समय भक्ति के साथ भजन गा सकते हैं।',
    category: 'practice',
    tags: ['timing', 'brahma muhurta', 'best time', 'morning'],
    relatedBhajanKeywords: ['समय', 'सुबह', 'रात']
  },

  // ========== BENEFITS OF BHAJANS ==========
  {
    id: 'benefits_meditation',
    question: 'Which bhajans are best for meditation?',
    questionHindi: 'ध्यान के लिए कौन से भजन सबसे अच्छे हैं?',
    answer: 'Slow, melodic bhajans with simple lyrics are ideal for meditation. Some popular choices are: 1) "Om Namah Shivaya" - calming and centering. 2) "So Hum" - helps with breath awareness. 3) "Hare Krishna Hare Rama" - repetitive and meditative. 4) "Gayatri Mantra" - powerful and purifying. 5) Any bhajan dedicated to your chosen deity works well.',
    answerHindi: 'धीमे, सुरीले भजन सरल गीतों के साथ ध्यान के लिए आदर्श हैं। कुछ लोकप्रिय विकल्प हैं: 1) "ॐ नमः शिवाय" - शांत और केंद्रीकृत। 2) "सो हम" - श्वास जागरूकता में मदद करता है। 3) "हरे कृष्ण हरे राम" - दोहराव वाला और ध्यान करने योग्य। 4) "गायत्री मंत्र" - शक्तिशाली और शुद्धिकारी।',
    category: 'benefits',
    tags: ['meditation', 'peace', 'focus', 'mantra'],
    relatedBhajanKeywords: ['ध्यान', 'शांति', 'focus']
  },
  {
    id: 'benefits_sleep',
    question: 'Which bhajans help with sleep?',
    questionHindi: 'नींद में मदद के लिए कौन से भजन हैं?',
    answer: 'Slow, soothing bhajans with gentle melodies are excellent for sleep. Try: 1) "Shanti Mantra" - promotes peace. 2) Slow renditions of "Hare Krishna" - calming repetition. 3) "Radha Krishna" bhajans - gentle love songs. 4) "Brahma Muhurta" bhajans - peaceful morning songs. 5) Any bhajan by Anup Jalota or similar artists with soft voices.',
    answerHindi: 'धीमे, सुखद भजन नींद में मदद करते हैं। कोशिश करें: 1) "शांति मंत्र" - शांति को बढ़ावा देता है। 2) "हरे कृष्ण" की धीमी प्रस्तुति - शांत दोहराव। 3) "राधा कृष्ण" भजन - कोमल प्रेम गीत।',
    category: 'benefits',
    tags: ['sleep', 'peace', 'relaxation', 'soft'],
    relatedBhajanKeywords: ['शांति', 'नींद', 'विश्राम']
  },
  {
    id: 'benefits_stress',
    question: 'How do bhajans help with stress?',
    questionHindi: 'भजन तनाव में कैसे मदद करते हैं?',
    answer: 'Bhajans reduce stress through multiple ways: 1) Rhythmic chanting calms the nervous system. 2) Devotional focus redirects worries to the divine. 3) Group singing creates community support. 4) The vibrations of mantras promote healing. 5) Regular practice increases resilience to stress. 6) Bhajans elevate mood through positive affirmations.',
    answerHindi: 'भजन कई तरीकों से तनाव को कम करते हैं: 1) लयबद्ध जाप तंत्रिका तंत्र को शांत करता है। 2) भक्तिमय ध्यान चिंताओं को दिव्य की ओर पुनर्निर्देशित करता है। 3) समूह गायन सामुदायिक समर्थन बनाता है। 4) मंत्रों के कंपन उपचार को बढ़ावा देते हैं।',
    category: 'benefits',
    tags: ['stress relief', 'mental health', 'calm', 'healing'],
    relatedBhajanKeywords: ['शांति', 'शक्ति', 'मन']
  },

  // ========== SINGERS & ARTISTS ==========
  {
    id: 'singer_anup_jalota',
    question: 'Who is Anup Jalota?',
    questionHindi: 'अनूप जलोटा कौन हैं?',
    answer: 'Anup Jalota is one of the most famous contemporary bhajan singers from India. Born in Mathura, he is renowned for his soulful renditions of Krishna bhajans and devotional music. He has performed bhajans for decades and is known as the "Bhajan Samraat" (emperor of bhajans). His gentle voice and emotional delivery make his bhajans deeply touching.',
    answerHindi: 'अनूप जलोटा भारत के सबसे प्रसिद्ध समकालीन भजन गायक हैं। मथुरा में जन्मे, वे कृष्ण भजन और भक्तिमय संगीत के अपने भावुक प्रस्तुतियों के लिए प्रसिद्ध हैं। उन्हें "भजन सम्राट" के रूप में जाना जाता है।',
    category: 'singer',
    tags: ['anup jalota', 'singer', 'krishna', 'bhajan samrat'],
    relatedBhajanKeywords: ['अनूप जलोटा', 'bhajan samrat']
  },

  // ========== GENERAL QUESTIONS ==========
  {
    id: 'general_what_is_bhajan',
    question: 'What is a bhajan?',
    questionHindi: 'भजन क्या है?',
    answer: 'A bhajan is a devotional song or hymn sung in praise of a deity or spiritual concept. Bhajans are a form of worship and meditation that dates back centuries in Hindu and Indian tradition. They are typically sung in groups or individually and express love, devotion, and reverence for the divine. Bhajans often have simple, repeating lyrics that make them easy to remember and chant.',
    answerHindi: 'भजन एक भक्तिमय गीत है जो किसी देवता या आध्यात्मिक अवधारणा की प्रशंसा में गाया जाता है। भजन हिंदू और भारतीय परंपरा में पूजा और ध्यान का एक रूप है। वे आमतौर पर समूह में या व्यक्तिगत रूप से गाए जाते हैं और दिव्य के प्रति प्रेम, भक्ति और श्रद्धा व्यक्त करते हैं।',
    category: 'technical',
    tags: ['bhajan', 'definition', 'devotional', 'hymn'],
    relatedBhajanKeywords: ['भजन', 'गीत', 'भक्ति']
  },
  {
    id: 'general_why_chant',
    question: 'Why do people chant mantras and bhajans?',
    questionHindi: 'लोग मंत्र और भजन का जाप क्यों करते हैं?',
    answer: 'People chant mantras and bhajans for several reasons: 1) Spiritual connection with the divine. 2) Mental peace and stress relief. 3) Purification of mind, body, and soul. 4) Development of concentration and focus. 5) Cultural and religious practice. 6) Healing of physical and emotional ailments. 7) Cultivation of devotion and compassion.',
    answerHindi: 'लोग मंत्र और भजन का जाप कई कारणों से करते हैं: 1) दिव्य के साथ आध्यात्मिक संबंध। 2) मानसिक शांति और तनाव राहत। 3) मन, शरीर और आत्मा की शुद्धि। 4) एकाग्रता और फोकस का विकास। 5) सांस्कृतिक और धार्मिक प्रथा।',
    category: 'technical',
    tags: ['chanting', 'mantra', 'benefits', 'why'],
    relatedBhajanKeywords: ['भजन', 'मंत्र', 'जाप']
  }
];

/**
 * Find best matching knowledge item for a query
 * Uses simple keyword matching and semantic similarity
 */
export function findMatchingKnowledge(query: string): KnowledgeItem | null {
  const lowerQuery = query.toLowerCase();
  
  // Exact keyword match (high confidence)
  for (const item of BHAJAN_KNOWLEDGE_BASE) {
    const questionLower = item.question.toLowerCase();
    const hindiLower = item.questionHindi?.toLowerCase() || '';
    
    if (questionLower.includes(lowerQuery) || lowerQuery.includes(questionLower.split(' ')[0])) {
      return item;
    }
    if (hindiLower.includes(lowerQuery)) {
      return item;
    }
  }

  // Tag-based match (medium confidence)
  for (const item of BHAJAN_KNOWLEDGE_BASE) {
    for (const tag of item.tags) {
      if (lowerQuery.includes(tag) || tag.includes(lowerQuery.split(' ')[0])) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Get related bhajan keywords from matched knowledge item
 */
export function getRelatedKeywords(knowledgeItem: KnowledgeItem): string[] {
  return knowledgeItem.relatedBhajanKeywords || [];
}

/**
 * Detect if query is a Q&A question vs bhajan search
 */
export function isQuestionQuery(query: string): boolean {
  const questionIndicators = ['what', 'who', 'how', 'why', 'when', 'where', 'क्या', 'कौन', 'कैसे', 'क्यों', 'कब', 'कहाँ', '?'];
  const lowerQuery = query.toLowerCase();
  return questionIndicators.some(indicator => lowerQuery.includes(indicator));
}
