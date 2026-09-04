/**
 * Raghavam — Domain 1: About You
 *
 * RULES ONLY.
 *
 * Important:
 * - These are deterministic lookup data.
 * - No runtime interpretation or LLM-generated text belongs here.
 * - User-facing archetype labels and strength phrases are Raghavam's
 *   editorial synthesis, not direct quotations from classical texts.
 * - Classical foundations are documented through `tradition`.
 *
 * `parashari`:
 *   A defensible association with classical sign/planet significations.
 *
 * `project-defined`:
 *   Raghavam editorial synthesis built from classical associations.
 *   It must NOT be presented to users as a direct classical rule.
 *
 * Atmakaraka is a Jaimini concept. Since the requested type only allows
 * "parashari" | "project-defined", AK interpretations are marked
 * `project-defined` and documented as Jaimini-derived editorial synthesis.
 */

export type RuleTradition = 'parashari' | 'project-defined';

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type Planet =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn';

export interface LocalizedPhrase {
  en: string;
  hi: string;
}

export interface StrengthRule extends LocalizedPhrase {
  sourceRule: string;
  tradition: RuleTradition;
}

export interface GrowthEdgeRule extends LocalizedPhrase {
  sourceRule: string;
  tradition: RuleTradition;
}

export interface LagnaRule {
  archetype: LocalizedPhrase;

  /**
   * Candidate order is significant.
   *
   * Candidate 1 -> Strength 1
   * Candidate 2 -> Strength 2, Moon modifier may alter it
   * Candidate 3 -> fallback when AK strength duplicates another strength
   *
   * The interpreter MUST NOT reorder these.
   */
  strengthCandidates: [StrengthRule, StrengthRule, StrengthRule];

  growthEdges: [GrowthEdgeRule, GrowthEdgeRule];

  tradition: RuleTradition;
}

export interface MoonModifierRule {
  tag:
    | 'assertive'
    | 'steady'
    | 'curious'
    | 'nurturing'
    | 'expressive'
    | 'discerning'
    | 'relational'
    | 'intense'
    | 'expansive'
    | 'disciplined'
    | 'independent'
    | 'empathetic';

  /**
   * Fixed phrase fragments.
   *
   * These are data, not instructions to an LLM.
   * The interpreter may select one fixed variant but must not
   * invent additional wording.
   */
  strengthModifier: LocalizedPhrase;

  tradition: RuleTradition;
}

export interface AtmakarakaRule {
  coreDrive: StrengthRule;
}

/**
 * Partial profile:
 *
 * These rules are intentionally separate from the Lagna-based archetypes.
 *
 * Moon provides the PRIMARY partial-profile family.
 * Sun contributes a deterministic identity-expression modifier.
 * Atmakaraka contributes a deterministic deeper-drive modifier.
 *
 * No Lagna is inferred.
 *
 * The interpreter selects:
 *   partialMoonArchetype[moonSign].sunElementVariants[sunElement] (Option A)
 *
 * The resulting archetype is selected from a fixed variant table,
 * not generated as free prose.
 */

export type Element =
  | 'fire'
  | 'earth'
  | 'air'
  | 'water';

export interface PartialArchetypeVariant {
  en: string;
  hi: string;
  sourceRule: string;
  tradition: RuleTradition;
}

export interface PartialMoonRule {
  base: PartialArchetypeVariant;

  /**
   * Four deterministic Sun-element variants.
   */
  sunElementVariants: Record<Element, PartialArchetypeVariant>;

  /**
   * Seven deterministic AK variants.
   */
  akVariants: Record<Planet, PartialArchetypeVariant>;
}

/* -------------------------------------------------------------------------- */
/* FULL PROFILE — LAGNA                                                       */
/* -------------------------------------------------------------------------- */

/**
 * SIMPLIFIED — not a direct classical rule, editorial synthesis.
 *
 * The sign foundations are based on classical rāśi descriptions,
 * elemental/quality classifications and sign lordship.
 */
export const LAGNA_RULES: Record<ZodiacSign, LagnaRule> = {
  aries: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Bold Initiator',
      hi: 'साहसी आरम्भकर्ता',
    },

    strengthCandidates: [
      {
        en: 'Acts decisively when a clear direction is needed',
        hi: 'स्पष्ट दिशा मिलने पर निर्णायक कदम उठाते हैं',
        sourceRule: 'lagna:aries + strength:initiative',
        tradition: 'project-defined',
      },
      {
        en: 'Brings courage and momentum to new situations',
        hi: 'नई परिस्थितियों में साहस और गति लेकर आते हैं',
        sourceRule: 'lagna:aries + strength:courage',
        tradition: 'project-defined',
      },
      {
        en: 'Naturally prefers direct action over prolonged hesitation',
        hi: 'लंबी दुविधा के बजाय सीधे कार्य करना स्वाभाविक रूप से पसंद करते हैं',
        sourceRule: 'lagna:aries + strength:direct_action',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from pausing briefly before acting on the first impulse',
        hi: 'पहली प्रतिक्रिया पर कार्य करने से पहले थोड़ा ठहरना लाभकारी हो सकता है',
        sourceRule: 'lagna:aries + growth:pause_before_action',
        tradition: 'project-defined',
      },
      {
        en: 'May need to leave room for others to set the pace sometimes',
        hi: 'कभी-कभी दूसरों को भी अपनी गति तय करने का अवसर देना लाभकारी हो सकता है',
        sourceRule: 'lagna:aries + growth:allow_others_pace',
        tradition: 'project-defined',
      },
    ],
  },

  taurus: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Grounded Builder',
      hi: 'स्थिर निर्माता',
    },

    strengthCandidates: [
      {
        en: 'Builds steadily toward tangible results',
        hi: 'ठोस परिणामों की ओर निरंतर और स्थिरता से बढ़ते हैं',
        sourceRule: 'lagna:taurus + strength:steadiness',
        tradition: 'project-defined',
      },
      {
        en: 'Values consistency and practical follow-through',
        hi: 'निरंतरता और व्यावहारिक रूप से कार्य पूरा करने को महत्व देते हैं',
        sourceRule: 'lagna:taurus + strength:consistency',
        tradition: 'project-defined',
      },
      {
        en: 'Can remain patient while something develops over time',
        hi: 'किसी चीज़ को समय के साथ विकसित होने देने में धैर्य रख सकते हैं',
        sourceRule: 'lagna:taurus + strength:patience',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from staying open when circumstances genuinely call for change',
        hi: 'जब परिस्थितियाँ वास्तव में बदलाव मांगें तब खुले मन से बदलाव स्वीकार करना लाभकारी हो सकता है',
        sourceRule: 'lagna:taurus + growth:flexibility',
        tradition: 'project-defined',
      },
      {
        en: 'May need to distinguish healthy stability from simply staying comfortable',
        hi: 'स्वस्थ स्थिरता और केवल सुविधा में बने रहने के बीच अंतर करना लाभकारी हो सकता है',
        sourceRule: 'lagna:taurus + growth:comfort_vs_stability',
        tradition: 'project-defined',
      },
    ],
  },

  gemini: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Curious Connector',
      hi: 'जिज्ञासु संप्रेषक',
    },

    strengthCandidates: [
      {
        en: 'Learns quickly by observing, asking and comparing',
        hi: 'देखकर, प्रश्न पूछकर और तुलना करके जल्दी सीखते हैं',
        sourceRule: 'lagna:gemini + strength:curiosity',
        tradition: 'project-defined',
      },
      {
        en: 'Connects ideas and communicates them clearly',
        hi: 'विचारों को जोड़कर उन्हें स्पष्ट रूप से व्यक्त करते हैं',
        sourceRule: 'lagna:gemini + strength:communication',
        tradition: 'project-defined',
      },
      {
        en: 'Adapts comfortably when new information changes the picture',
        hi: 'नई जानकारी से परिस्थिति बदलने पर सहजता से अनुकूलन करते हैं',
        sourceRule: 'lagna:gemini + strength:adaptability',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from finishing important threads before moving to the next idea',
        hi: 'अगले विचार पर जाने से पहले महत्वपूर्ण कार्य को पूरा करना लाभकारी हो सकता है',
        sourceRule: 'lagna:gemini + growth:follow_through',
        tradition: 'project-defined',
      },
      {
        en: 'May need to protect attention from too many competing inputs',
        hi: 'बहुत अधिक प्रतिस्पर्धी सूचनाओं से अपने ध्यान की रक्षा करना लाभकारी हो सकता है',
        sourceRule: 'lagna:gemini + growth:attention_management',
        tradition: 'project-defined',
      },
    ],
  },

  cancer: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Protective Nurturer',
      hi: 'संरक्षक पोषक',
    },

    strengthCandidates: [
      {
        en: 'Notices what people and situations need emotionally',
        hi: 'लोगों और परिस्थितियों की भावनात्मक आवश्यकताओं को पहचानते हैं',
        sourceRule: 'lagna:cancer + strength:emotional_awareness',
        tradition: 'project-defined',
      },
      {
        en: 'Creates a sense of belonging and familiarity',
        hi: 'अपनापन और जुड़ाव का वातावरण बनाने में सक्षम होते हैं',
        sourceRule: 'lagna:cancer + strength:belonging',
        tradition: 'project-defined',
      },
      {
        en: 'Protects what they consider meaningful',
        hi: 'जिसे महत्वपूर्ण मानते हैं उसकी रक्षा करने की प्रवृत्ति रखते हैं',
        sourceRule: 'lagna:cancer + strength:protection',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from separating personal feelings from every situation',
        hi: 'हर परिस्थिति को अपनी व्यक्तिगत भावनाओं से अलग देखना लाभकारी हो सकता है',
        sourceRule: 'lagna:cancer + growth:emotional_boundaries',
        tradition: 'project-defined',
      },
      {
        en: 'May need to express needs directly instead of expecting others to sense them',
        hi: 'दूसरों से बिना कहे समझने की अपेक्षा करने के बजाय अपनी आवश्यकताएँ स्पष्ट रूप से बताना लाभकारी हो सकता है',
        sourceRule: 'lagna:cancer + growth:direct_needs',
        tradition: 'project-defined',
      },
    ],
  },

  leo: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Confident Radiator',
      hi: 'आत्मविश्वासी प्रेरक',
    },

    strengthCandidates: [
      {
        en: 'Brings confidence and visible presence to what they do',
        hi: 'अपने कार्यों में आत्मविश्वास और प्रभावशाली उपस्थिति लाते हैं',
        sourceRule: 'lagna:leo + strength:presence',
        tradition: 'project-defined',
      },
      {
        en: 'Can take responsibility when leadership is required',
        hi: 'नेतृत्व की आवश्यकता होने पर जिम्मेदारी संभाल सकते हैं',
        sourceRule: 'lagna:leo + strength:leadership',
        tradition: 'project-defined',
      },
      {
        en: 'Encourages others through warmth and conviction',
        hi: 'उत्साह और आत्मविश्वास के माध्यम से दूसरों को प्रेरित करते हैं',
        sourceRule: 'lagna:leo + strength:encouragement',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from making room for recognition of others as well',
        hi: 'दूसरों के योगदान को भी समान रूप से पहचान देना लाभकारी हो सकता है',
        sourceRule: 'lagna:leo + growth:shared_recognition',
        tradition: 'project-defined',
      },
      {
        en: 'May need to separate confidence from the need to prove a point',
        hi: 'आत्मविश्वास और अपनी बात सिद्ध करने की आवश्यकता के बीच अंतर करना लाभकारी हो सकता है',
        sourceRule: 'lagna:leo + growth:confidence_without_proving',
        tradition: 'project-defined',
      },
    ],
  },

  virgo: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Precise Improver',
      hi: 'सूक्ष्म सुधारक',
    },

    strengthCandidates: [
      {
        en: 'Notices details that can improve the final result',
        hi: 'अंतिम परिणाम को बेहतर बनाने वाले सूक्ष्म विवरणों को पहचानते हैं',
        sourceRule: 'lagna:virgo + strength:precision',
        tradition: 'project-defined',
      },
      {
        en: 'Approaches problems through analysis and practical refinement',
        hi: 'समस्याओं को विश्लेषण और व्यावहारिक सुधार के माध्यम से देखते हैं',
        sourceRule: 'lagna:virgo + strength:analysis',
        tradition: 'project-defined',
      },
      {
        en: 'Can turn an imperfect process into a more useful one',
        hi: 'अपूर्ण प्रक्रिया को अधिक उपयोगी और व्यवस्थित बना सकते हैं',
        sourceRule: 'lagna:virgo + strength:refinement',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from knowing when something is good enough to move forward',
        hi: 'यह पहचानना लाभकारी हो सकता है कि कब कोई कार्य आगे बढ़ने के लिए पर्याप्त अच्छा है',
        sourceRule: 'lagna:virgo + growth:good_enough',
        tradition: 'project-defined',
      },
      {
        en: 'May need to balance useful analysis with timely action',
        hi: 'उपयोगी विश्लेषण और समय पर कार्यवाही के बीच संतुलन रखना लाभकारी हो सकता है',
        sourceRule: 'lagna:virgo + growth:analysis_to_action',
        tradition: 'project-defined',
      },
    ],
  },

  libra: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Harmonious Diplomat',
      hi: 'संतुलित समन्वयक',
    },

    strengthCandidates: [
      {
        en: 'Naturally considers multiple perspectives before deciding',
        hi: 'निर्णय लेने से पहले स्वाभाविक रूप से कई दृष्टिकोणों पर विचार करते हैं',
        sourceRule: 'lagna:libra + strength:perspective',
        tradition: 'project-defined',
      },
      {
        en: 'Can create cooperation between different people',
        hi: 'विभिन्न लोगों के बीच सहयोग का वातावरण बना सकते हैं',
        sourceRule: 'lagna:libra + strength:cooperation',
        tradition: 'project-defined',
      },
      {
        en: 'Values fairness and balance in interactions',
        hi: 'व्यवहार में निष्पक्षता और संतुलन को महत्व देते हैं',
        sourceRule: 'lagna:libra + strength:balance',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from making a clear choice even when every option has trade-offs',
        hi: 'जब हर विकल्प में कुछ कमी हो तब भी स्पष्ट निर्णय लेना लाभकारी हो सकता है',
        sourceRule: 'lagna:libra + growth:decisiveness',
        tradition: 'project-defined',
      },
      {
        en: 'May need to protect personal priorities while maintaining harmony',
        hi: 'सामंजस्य बनाए रखते हुए अपनी प्राथमिकताओं की रक्षा करना लाभकारी हो सकता है',
        sourceRule: 'lagna:libra + growth:personal_priorities',
        tradition: 'project-defined',
      },
    ],
  },

  scorpio: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Focused Transformer',
      hi: 'एकाग्र रूपांतरक',
    },

    strengthCandidates: [
      {
        en: 'Looks beneath the surface before trusting an explanation',
        hi: 'किसी बात को स्वीकार करने से पहले उसकी गहराई को समझने की कोशिश करते हैं',
        sourceRule: 'lagna:scorpio + strength:depth',
        tradition: 'project-defined',
      },
      {
        en: 'Can sustain focus when a matter genuinely matters',
        hi: 'किसी विषय को महत्वपूर्ण मानने पर उस पर गहरी एकाग्रता बनाए रख सकते हैं',
        sourceRule: 'lagna:scorpio + strength:focus',
        tradition: 'project-defined',
      },
      {
        en: 'Has the capacity to rebuild after significant change',
        hi: 'महत्वपूर्ण बदलाव के बाद स्वयं को फिर से व्यवस्थित करने की क्षमता रखते हैं',
        sourceRule: 'lagna:scorpio + strength:renewal',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from sharing concerns before they become internal burdens',
        hi: 'चिंताओं को भीतर जमा होने देने के बजाय समय रहते साझा करना लाभकारी हो सकता है',
        sourceRule: 'lagna:scorpio + growth:open_expression',
        tradition: 'project-defined',
      },
      {
        en: 'May need to distinguish healthy discernment from prolonged suspicion',
        hi: 'सजग विवेक और लंबे समय तक संदेह बनाए रखने के बीच अंतर करना लाभकारी हो सकता है',
        sourceRule: 'lagna:scorpio + growth:discernment_vs_suspicion',
        tradition: 'project-defined',
      },
    ],
  },

  sagittarius: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Meaning-Seeking Explorer',
      hi: 'अर्थ खोजने वाला अन्वेषक',
    },

    strengthCandidates: [
      {
        en: 'Looks for meaning and a larger principle behind experience',
        hi: 'अनुभवों के पीछे अर्थ और व्यापक सिद्धांत खोजते हैं',
        sourceRule: 'lagna:sagittarius + strength:meaning',
        tradition: 'project-defined',
      },
      {
        en: 'Learns through exploration, study and broad experience',
        hi: 'अन्वेषण, अध्ययन और व्यापक अनुभवों के माध्यम से सीखते हैं',
        sourceRule: 'lagna:sagittarius + strength:learning',
        tradition: 'project-defined',
      },
      {
        en: 'Can encourage others to think beyond immediate limitations',
        hi: 'दूसरों को तत्काल सीमाओं से आगे सोचने के लिए प्रेरित कर सकते हैं',
        sourceRule: 'lagna:sagittarius + strength:vision',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from turning broad ideas into concrete next steps',
        hi: 'व्यापक विचारों को ठोस अगले कदमों में बदलना लाभकारी हो सकता है',
        sourceRule: 'lagna:sagittarius + growth:execution',
        tradition: 'project-defined',
      },
      {
        en: 'May need to leave room for perspectives that differ from their own',
        hi: 'अपने दृष्टिकोण से अलग विचारों के लिए भी स्थान रखना लाभकारी हो सकता है',
        sourceRule: 'lagna:sagittarius + growth:perspective_openness',
        tradition: 'project-defined',
      },
    ],
  },

  capricorn: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Disciplined Achiever',
      hi: 'अनुशासित साधक',
    },

    strengthCandidates: [
      {
        en: 'Can work patiently toward long-term outcomes',
        hi: 'दीर्घकालिक परिणामों की दिशा में धैर्यपूर्वक काम कर सकते हैं',
        sourceRule: 'lagna:capricorn + strength:discipline',
        tradition: 'project-defined',
      },
      {
        en: 'Takes responsibility seriously when something matters',
        hi: 'महत्वपूर्ण कार्यों की जिम्मेदारी को गंभीरता से लेते हैं',
        sourceRule: 'lagna:capricorn + strength:responsibility',
        tradition: 'project-defined',
      },
      {
        en: 'Understands that meaningful results often require sustained effort',
        hi: 'समझते हैं कि सार्थक परिणामों के लिए निरंतर प्रयास आवश्यक हो सकता है',
        sourceRule: 'lagna:capricorn + strength:persistence',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from allowing progress to include rest and flexibility',
        hi: 'प्रगति में विश्राम और लचीलापन भी शामिल करना लाभकारी हो सकता है',
        sourceRule: 'lagna:capricorn + growth:flexible_effort',
        tradition: 'project-defined',
      },
      {
        en: 'May need to recognize progress before reaching the final goal',
        hi: 'अंतिम लक्ष्य तक पहुँचने से पहले हुई प्रगति को भी पहचानना लाभकारी हो सकता है',
        sourceRule: 'lagna:capricorn + growth:recognize_progress',
        tradition: 'project-defined',
      },
    ],
  },

  aquarius: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Independent Reformer',
      hi: 'स्वतंत्र सुधारक',
    },

    strengthCandidates: [
      {
        en: 'Can question established approaches and consider alternatives',
        hi: 'स्थापित तरीकों पर प्रश्न उठाकर वैकल्पिक दृष्टिकोण खोज सकते हैं',
        sourceRule: 'lagna:aquarius + strength:independent_thinking',
        tradition: 'project-defined',
      },
      {
        en: 'Values ideas that can improve life beyond the individual',
        hi: 'ऐसे विचारों को महत्व देते हैं जो व्यक्ति से आगे व्यापक जीवन को बेहतर बना सकें',
        sourceRule: 'lagna:aquarius + strength:collective_thinking',
        tradition: 'project-defined',
      },
      {
        en: 'Can remain mentally independent under social pressure',
        hi: 'सामाजिक दबाव के बीच भी मानसिक स्वतंत्रता बनाए रख सकते हैं',
        sourceRule: 'lagna:aquarius + strength:independence',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from explaining ideas in terms others can immediately connect with',
        hi: 'विचारों को इस तरह समझाना लाभकारी हो सकता है कि दूसरे उनसे तुरंत जुड़ सकें',
        sourceRule: 'lagna:aquarius + growth:accessibility',
        tradition: 'project-defined',
      },
      {
        en: 'May need to balance independence with meaningful participation',
        hi: 'स्वतंत्रता और सार्थक सहभागिता के बीच संतुलन रखना लाभकारी हो सकता है',
        sourceRule: 'lagna:aquarius + growth:participation',
        tradition: 'project-defined',
      },
    ],
  },

  pisces: {
    tradition: 'project-defined',

    archetype: {
      en: 'The Compassionate Visionary',
      hi: 'करुणामय दूरदर्शी',
    },

    strengthCandidates: [
      {
        en: 'Can sense subtle emotional and human dimensions of situations',
        hi: 'परिस्थितियों के सूक्ष्म भावनात्मक और मानवीय पक्षों को समझ सकते हैं',
        sourceRule: 'lagna:pisces + strength:sensitivity',
        tradition: 'project-defined',
      },
      {
        en: 'Uses imagination to see possibilities beyond the obvious',
        hi: 'कल्पनाशक्ति के माध्यम से स्पष्ट दिखाई देने वाली बातों से आगे संभावनाएँ देख सकते हैं',
        sourceRule: 'lagna:pisces + strength:imagination',
        tradition: 'project-defined',
      },
      {
        en: 'Can respond to others with empathy and understanding',
        hi: 'दूसरों के प्रति सहानुभूति और समझ के साथ प्रतिक्रिया दे सकते हैं',
        sourceRule: 'lagna:pisces + strength:empathy',
        tradition: 'project-defined',
      },
    ],

    growthEdges: [
      {
        en: 'May benefit from giving intuition a practical structure',
        hi: 'अंतर्ज्ञान को व्यावहारिक ढाँचे से जोड़ना लाभकारी हो सकता है',
        sourceRule: 'lagna:pisces + growth:structure',
        tradition: 'project-defined',
      },
      {
        en: 'May need clear boundaries when supporting other people',
        hi: 'दूसरों का साथ देते समय स्पष्ट सीमाएँ रखना लाभकारी हो सकता है',
        sourceRule: 'lagna:pisces + growth:boundaries',
        tradition: 'project-defined',
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* MOON MODIFIERS                                                             */
/* -------------------------------------------------------------------------- */

/**
 * SIMPLIFIED — editorial synthesis from classical Moon-as-mind symbolism
 * combined with broad sign characteristics.
 *
 * These modifiers do NOT create new strengths or weaknesses.
 * They only provide a fixed wording variant for Strength 2.
 */
export const MOON_MODIFIERS: Record<ZodiacSign, MoonModifierRule> = {
  aries: {
    tag: 'assertive',
    strengthModifier: {
      en: 'with an assertive emotional style',
      hi: 'दृढ़ और सक्रिय भावनात्मक शैली के साथ',
    },
    tradition: 'project-defined',
  },

  taurus: {
    tag: 'steady',
    strengthModifier: {
      en: 'with a steady and grounded emotional style',
      hi: 'स्थिर और व्यावहारिक भावनात्मक शैली के साथ',
    },
    tradition: 'project-defined',
  },

  gemini: {
    tag: 'curious',
    strengthModifier: {
      en: 'with a curious and mentally active style',
      hi: 'जिज्ञासु और मानसिक रूप से सक्रिय शैली के साथ',
    },
    tradition: 'project-defined',
  },

  cancer: {
    tag: 'nurturing',
    strengthModifier: {
      en: 'with a nurturing and emotionally attentive style',
      hi: 'पोषण देने वाली और भावनात्मक रूप से सजग शैली के साथ',
    },
    tradition: 'project-defined',
  },

  leo: {
    tag: 'expressive',
    strengthModifier: {
      en: 'with a warm and expressive emotional style',
      hi: 'उष्ण और अभिव्यक्तिपूर्ण भावनात्मक शैली के साथ',
    },
    tradition: 'project-defined',
  },

  virgo: {
    tag: 'discerning',
    strengthModifier: {
      en: 'with a discerning and detail-aware style',
      hi: 'विवेकपूर्ण और सूक्ष्म विवरणों पर ध्यान देने वाली शैली के साथ',
    },
    tradition: 'project-defined',
  },

  libra: {
    tag: 'relational',
    strengthModifier: {
      en: 'with a relational and harmony-seeking style',
      hi: 'संबंधों और सामंजस्य को महत्व देने वाली शैली के साथ',
    },
    tradition: 'project-defined',
  },

  scorpio: {
    tag: 'intense',
    strengthModifier: {
      en: 'with an intense and deeply observant style',
      hi: 'गहन और सूक्ष्म निरीक्षण करने वाली शैली के साथ',
    },
    tradition: 'project-defined',
  },

  sagittarius: {
    tag: 'expansive',
    strengthModifier: {
      en: 'with an expansive and meaning-seeking style',
      hi: 'विस्तृत दृष्टि और अर्थ खोजने वाली शैली के साथ',
    },
    tradition: 'project-defined',
  },

  capricorn: {
    tag: 'disciplined',
    strengthModifier: {
      en: 'with a disciplined and composed style',
      hi: 'अनुशासित और संयमित शैली के साथ',
    },
    tradition: 'project-defined',
  },

  aquarius: {
    tag: 'independent',
    strengthModifier: {
      en: 'with an independent and unconventional style',
      hi: 'स्वतंत्र और पारंपरिक सीमाओं से अलग शैली के साथ',
    },
    tradition: 'project-defined',
  },

  pisces: {
    tag: 'empathetic',
    strengthModifier: {
      en: 'with an empathetic and imaginative style',
      hi: 'सहानुभूतिपूर्ण और कल्पनाशील शैली के साथ',
    },
    tradition: 'project-defined',
  },
};

/* -------------------------------------------------------------------------- */
/* ATMAKARAKA CORE DRIVES                                                     */
/* -------------------------------------------------------------------------- */

/**
 * These are Jaimini-derived editorial syntheses.
 *
 * IMPORTANT:
 * Atmakaraka is a Jaimini concept, not a direct Parashari sign rule.
 * Therefore these are intentionally marked project-defined.
 *
 * The interpreter uses exactly ONE of these as Strength 3.
 */
export const ATMAKARAKA_RULES: Record<Planet, AtmakarakaRule> = {
  sun: {
    coreDrive: {
      en: 'A drive to develop responsible self-direction and purposeful leadership',
      hi: 'जिम्मेदार आत्म-दिशा और उद्देश्यपूर्ण नेतृत्व विकसित करने की प्रेरणा',
      sourceRule: 'atmakaraka:sun + core_drive:responsible_leadership',
      tradition: 'project-defined',
    },
  },

  moon: {
    coreDrive: {
      en: 'A drive to understand, care for and work skillfully with the emotional world',
      hi: 'भावनात्मक संसार को समझने, सँभालने और उसके साथ कुशलता से काम करने की प्रेरणा',
      sourceRule: 'atmakaraka:moon + core_drive:emotional_understanding',
      tradition: 'project-defined',
    },
  },

  mars: {
    coreDrive: {
      en: 'A drive to develop courage, disciplined action and constructive strength',
      hi: 'साहस, अनुशासित कर्म और रचनात्मक शक्ति विकसित करने की प्रेरणा',
      sourceRule: 'atmakaraka:mars + core_drive:constructive_strength',
      tradition: 'project-defined',
    },
  },

  mercury: {
    coreDrive: {
      en: 'A drive to develop clear thinking, communication and practical intelligence',
      hi: 'स्पष्ट सोच, संचार और व्यावहारिक बुद्धि विकसित करने की प्रेरणा',
      sourceRule: 'atmakaraka:mercury + core_drive:clear_intelligence',
      tradition: 'project-defined',
    },
  },

  jupiter: {
    coreDrive: {
      en: 'A drive toward understanding, wisdom and meaningful guidance',
      hi: 'समझ, ज्ञान और सार्थक मार्गदर्शन की ओर बढ़ने की प्रेरणा',
      sourceRule: 'atmakaraka:jupiter + core_drive:wisdom',
      tradition: 'project-defined',
    },
  },

  venus: {
    coreDrive: {
      en: 'A drive to cultivate harmony, appreciation, connection and refined expression',
      hi: 'सामंजस्य, सौंदर्य-बोध, संबंध और परिष्कृत अभिव्यक्ति विकसित करने की प्रेरणा',
      sourceRule: 'atmakaraka:venus + core_drive:harmony',
      tradition: 'project-defined',
    },
  },

  saturn: {
    coreDrive: {
      en: 'A drive to develop patience, responsibility and durable discipline',
      hi: 'धैर्य, जिम्मेदारी और स्थायी अनुशासन विकसित करने की प्रेरणा',
      sourceRule: 'atmakaraka:saturn + core_drive:discipline',
      tradition: 'project-defined',
    },
  },
};

/* -------------------------------------------------------------------------- */
/* PARTIAL PROFILE — MOON PRIMARY                                             */
/* -------------------------------------------------------------------------- */

/**
 * PARTIAL PROFILE RULES
 *
 * No Lagna is inferred.
 *
 * The Moon supplies the primary partial-profile family.
 * Sun and Atmakaraka participate through fixed variant lookups.
 *
 * This is intentionally a separate naming system from full-profile
 * archetypes so that a user can never mistake the partial result
 * for a complete Lagna-based profile.
 *
 * All entries are project-defined editorial synthesis.
 */

export const PARTIAL_PROFILE_RULES: Record<
  ZodiacSign,
  PartialMoonRule
> = {
  aries: {
    base: {
      en: 'The Emotionally Driven Explorer',
      hi: 'भावना-प्रेरित अन्वेषक',
      sourceRule: 'partial:moon:aries',
      tradition: 'project-defined',
    },

    sunElementVariants: {
      fire: {
        en: 'The Emotionally Driven Pioneer',
        hi: 'भावना-प्रेरित अग्रदूत',
        sourceRule: 'partial:moon:aries + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Emotion-Led Explorer',
        hi: 'स्थिर भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Curious Emotion-Led Explorer',
        hi: 'जिज्ञासु भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Emotion-Led Explorer',
        hi: 'संवेदनशील भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + sun_element:water',
        tradition: 'project-defined',
      },
    },

    akVariants: {
      sun: {
        en: 'The Purpose-Led Emotion Explorer',
        hi: 'उद्देश्य-प्रेरित भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Nurturing Emotion Explorer',
        hi: 'पोषणकारी भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courage-Led Emotion Explorer',
        hi: 'साहस-प्रेरित भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Thoughtful Emotion Explorer',
        hi: 'विचारशील भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Emotion Explorer',
        hi: 'ज्ञान-खोजी भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Emotion Explorer',
        hi: 'सामंजस्य-खोजी भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Emotion Explorer',
        hi: 'अनुशासित भावनात्मक अन्वेषक',
        sourceRule: 'partial:moon:aries + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  taurus: {
    base: {
      en: 'The Emotionally Grounded Cultivator',
      hi: 'भावनात्मक रूप से स्थिर संवर्धक',
      sourceRule: 'partial:moon:taurus',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Grounded Passionate Cultivator',
        hi: 'स्थिर और उत्साही संवर्धक',
        sourceRule: 'partial:moon:taurus + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Deeply Grounded Cultivator',
        hi: 'गहराई से स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Thoughtful Grounded Cultivator',
        hi: 'विचारशील स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Grounded Cultivator',
        hi: 'संवेदनशील स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Grounded Cultivator',
        hi: 'उद्देश्यपूर्ण स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Nurturing Grounded Cultivator',
        hi: 'पोषणकारी स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Determined Grounded Cultivator',
        hi: 'दृढ़ स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Practical Grounded Cultivator',
        hi: 'व्यावहारिक स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Grounded Cultivator',
        hi: 'ज्ञान-खोजी स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Grounded Cultivator',
        hi: 'सामंजस्य-खोजी स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Grounded Cultivator',
        hi: 'अनुशासित स्थिर संवर्धक',
        sourceRule: 'partial:moon:taurus + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  gemini: {
    base: {
      en: 'The Emotionally Curious Connector',
      hi: 'भावनात्मक रूप से जिज्ञासु संप्रेषक',
      sourceRule: 'partial:moon:gemini',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Energetic Curious Connector',
        hi: 'ऊर्जावान जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Practical Curious Connector',
        hi: 'व्यावहारिक जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Highly Curious Connector',
        hi: 'अत्यंत जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Curious Connector',
        hi: 'संवेदनशील जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Curious Connector',
        hi: 'उद्देश्यपूर्ण जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Emotionally Attuned Curious Connector',
        hi: 'भावनात्मक रूप से सजग जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Action-Oriented Curious Connector',
        hi: 'कर्म-उन्मुख जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Analytical Curious Connector',
        hi: 'विश्लेषणात्मक जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Curious Connector',
        hi: 'ज्ञान-खोजी जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Curious Connector',
        hi: 'सामंजस्य-खोजी जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Curious Connector',
        hi: 'अनुशासित जिज्ञासु संप्रेषक',
        sourceRule: 'partial:moon:gemini + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  cancer: {
    base: {
      en: 'The Emotionally Protective Nurturer',
      hi: 'भावनात्मक संरक्षक पोषक',
      sourceRule: 'partial:moon:cancer',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Warm Protective Nurturer',
        hi: 'उष्ण और संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Protective Nurturer',
        hi: 'स्थिर और संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Thoughtful Protective Nurturer',
        hi: 'विचारशील संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Deeply Sensitive Nurturer',
        hi: 'गहराई से संवेदनशील पोषक',
        sourceRule: 'partial:moon:cancer + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Protective Nurturer',
        hi: 'उद्देश्यपूर्ण संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Deeply Nurturing Protector',
        hi: 'गहराई से पोषणकारी संरक्षक',
        sourceRule: 'partial:moon:cancer + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Protective Nurturer',
        hi: 'साहसी संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Thoughtful Protective Nurturer',
        hi: 'विचारशील संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wise Protective Nurturer',
        hi: 'बुद्धिमान संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmonious Protective Nurturer',
        hi: 'सामंजस्यपूर्ण संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Steady Protective Nurturer',
        hi: 'स्थिर संरक्षक पोषक',
        sourceRule: 'partial:moon:cancer + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  leo: {
    base: {
      en: 'The Emotionally Expressive Creator',
      hi: 'भावनात्मक रूप से अभिव्यक्तिशील सृजक',
      sourceRule: 'partial:moon:leo',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Passionate Expressive Creator',
        hi: 'उत्साही अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Expressive Creator',
        hi: 'स्थिर अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Social Expressive Creator',
        hi: 'सामाजिक अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Expressive Creator',
        hi: 'संवेदनशील अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Expressive Creator',
        hi: 'उद्देश्यपूर्ण अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Nurturing Expressive Creator',
        hi: 'पोषणकारी अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Expressive Creator',
        hi: 'साहसी अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Articulate Expressive Creator',
        hi: 'वाक्पटु अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Led Expressive Creator',
        hi: 'ज्ञान-प्रेरित अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Aesthetic Expressive Creator',
        hi: 'सौंदर्य-बोध वाला अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Expressive Creator',
        hi: 'अनुशासित अभिव्यक्तिशील सृजक',
        sourceRule: 'partial:moon:leo + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  virgo: {
    base: {
      en: 'The Emotionally Discerning Improver',
      hi: 'भावनात्मक रूप से विवेकशील सुधारक',
      sourceRule: 'partial:moon:virgo',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Energetic Discerning Improver',
        hi: 'ऊर्जावान विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Discerning Improver',
        hi: 'स्थिर विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Analytical Discerning Improver',
        hi: 'विश्लेषणात्मक विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Discerning Improver',
        hi: 'संवेदनशील विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Discerning Improver',
        hi: 'उद्देश्यपूर्ण विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Caring Discerning Improver',
        hi: 'स्नेहपूर्ण विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Action-Oriented Discerning Improver',
        hi: 'कर्म-उन्मुख विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Analytical Discerning Improver',
        hi: 'विश्लेषणात्मक विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Discerning Improver',
        hi: 'ज्ञान-खोजी विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Discerning Improver',
        hi: 'सामंजस्य-खोजी विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Discerning Improver',
        hi: 'अनुशासित विवेकशील सुधारक',
        sourceRule: 'partial:moon:virgo + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  libra: {
    base: {
      en: 'The Emotionally Harmonizing Connector',
      hi: 'भावनात्मक सामंजस्यकारी संप्रेषक',
      sourceRule: 'partial:moon:libra',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Warm Harmonizing Connector',
        hi: 'उष्ण सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Harmonizing Connector',
        hi: 'स्थिर सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Social Harmonizing Connector',
        hi: 'सामाजिक सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Harmonizing Connector',
        hi: 'संवेदनशील सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Harmonizing Connector',
        hi: 'उद्देश्यपूर्ण सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Nurturing Harmonizing Connector',
        hi: 'पोषणकारी सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Harmonizing Connector',
        hi: 'साहसी सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Articulate Harmonizing Connector',
        hi: 'वाक्पटु सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Led Harmonizing Connector',
        hi: 'ज्ञान-प्रेरित सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Graceful Harmonizing Connector',
        hi: 'सौम्य सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Harmonizing Connector',
        hi: 'अनुशासित सामंजस्यकारी संप्रेषक',
        sourceRule: 'partial:moon:libra + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  scorpio: {
    base: {
      en: 'The Emotionally Intense Observer',
      hi: 'भावनात्मक रूप से गहन पर्यवेक्षक',
      sourceRule: 'partial:moon:scorpio',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Passionate Intense Observer',
        hi: 'उत्साही गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Intense Observer',
        hi: 'स्थिर गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Analytical Intense Observer',
        hi: 'विश्लेषणात्मक गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Deeply Sensitive Observer',
        hi: 'गहराई से संवेदनशील पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Intense Observer',
        hi: 'उद्देश्यपूर्ण गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Emotionally Attuned Intense Observer',
        hi: 'भावनात्मक रूप से सजग गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Intense Observer',
        hi: 'साहसी गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Investigative Intense Observer',
        hi: 'अन्वेषणशील गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Intense Observer',
        hi: 'ज्ञान-खोजी गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Intense Observer',
        hi: 'सामंजस्य-खोजी गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Intense Observer',
        hi: 'अनुशासित गहन पर्यवेक्षक',
        sourceRule: 'partial:moon:scorpio + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  sagittarius: {
    base: {
      en: 'The Emotionally Meaning-Seeking Explorer',
      hi: 'भावनात्मक अर्थ-खोजी अन्वेषक',
      sourceRule: 'partial:moon:sagittarius',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Passionate Meaning-Seeking Explorer',
        hi: 'उत्साही अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Meaning-Seeking Explorer',
        hi: 'स्थिर अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Curious Meaning-Seeking Explorer',
        hi: 'जिज्ञासु अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Meaning-Seeking Explorer',
        hi: 'संवेदनशील अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purpose-Led Meaning-Seeking Explorer',
        hi: 'उद्देश्य-प्रेरित अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Compassionate Meaning-Seeking Explorer',
        hi: 'करुणामय अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Meaning-Seeking Explorer',
        hi: 'साहसी अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Learning-Oriented Meaning-Seeking Explorer',
        hi: 'अध्ययनशील अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Explorer',
        hi: 'ज्ञान-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Explorer',
        hi: 'सामंजस्य-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Meaning-Seeking Explorer',
        hi: 'अनुशासित अर्थ-खोजी अन्वेषक',
        sourceRule: 'partial:moon:sagittarius + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  capricorn: {
    base: {
      en: 'The Emotionally Disciplined Builder',
      hi: 'भावनात्मक रूप से अनुशासित निर्माता',
      sourceRule: 'partial:moon:capricorn',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Driven Disciplined Builder',
        hi: 'प्रेरित अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Deeply Grounded Disciplined Builder',
        hi: 'गहराई से स्थिर अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Thoughtful Disciplined Builder',
        hi: 'विचारशील अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Disciplined Builder',
        hi: 'संवेदनशील अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Disciplined Builder',
        hi: 'उद्देश्यपूर्ण अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Caring Disciplined Builder',
        hi: 'स्नेहपूर्ण अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Determined Disciplined Builder',
        hi: 'दृढ़ अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Practical Disciplined Builder',
        hi: 'व्यावहारिक अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Led Disciplined Builder',
        hi: 'ज्ञान-प्रेरित अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Balanced Disciplined Builder',
        hi: 'संतुलित अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Deeply Disciplined Builder',
        hi: 'गहराई से अनुशासित निर्माता',
        sourceRule: 'partial:moon:capricorn + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  aquarius: {
    base: {
      en: 'The Emotionally Independent Thinker',
      hi: 'भावनात्मक रूप से स्वतंत्र विचारक',
      sourceRule: 'partial:moon:aquarius',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Bold Independent Thinker',
        hi: 'साहसी स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Practical Independent Thinker',
        hi: 'व्यावहारिक स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Highly Independent Thinker',
        hi: 'अत्यंत स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Sensitive Independent Thinker',
        hi: 'संवेदनशील स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Independent Thinker',
        hi: 'उद्देश्यपूर्ण स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Compassionate Independent Thinker',
        hi: 'करुणामय स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Independent Thinker',
        hi: 'साहसी स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Analytical Independent Thinker',
        hi: 'विश्लेषणात्मक स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Seeking Independent Thinker',
        hi: 'ज्ञान-खोजी स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmony-Seeking Independent Thinker',
        hi: 'सामंजस्य-खोजी स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Independent Thinker',
        hi: 'अनुशासित स्वतंत्र विचारक',
        sourceRule: 'partial:moon:aquarius + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },

  pisces: {
    base: {
      en: 'The Emotionally Compassionate Visionary',
      hi: 'भावनात्मक करुणामय दूरदर्शी',
      sourceRule: 'partial:moon:pisces',
      tradition: 'project-defined',
    },
    sunElementVariants: {
      fire: {
        en: 'The Inspired Compassionate Visionary',
        hi: 'प्रेरित करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + sun_element:fire',
        tradition: 'project-defined',
      },
      earth: {
        en: 'The Grounded Compassionate Visionary',
        hi: 'स्थिर करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + sun_element:earth',
        tradition: 'project-defined',
      },
      air: {
        en: 'The Imaginative Compassionate Visionary',
        hi: 'कल्पनाशील करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + sun_element:air',
        tradition: 'project-defined',
      },
      water: {
        en: 'The Deeply Compassionate Visionary',
        hi: 'गहराई से करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + sun_element:water',
        tradition: 'project-defined',
      },
    },
    akVariants: {
      sun: {
        en: 'The Purposeful Compassionate Visionary',
        hi: 'उद्देश्यपूर्ण करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:sun',
        tradition: 'project-defined',
      },
      moon: {
        en: 'The Deeply Nurturing Visionary',
        hi: 'गहराई से पोषणकारी दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:moon',
        tradition: 'project-defined',
      },
      mars: {
        en: 'The Courageous Compassionate Visionary',
        hi: 'साहसी करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:mars',
        tradition: 'project-defined',
      },
      mercury: {
        en: 'The Thoughtful Compassionate Visionary',
        hi: 'विचारशील करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:mercury',
        tradition: 'project-defined',
      },
      jupiter: {
        en: 'The Wisdom-Led Compassionate Visionary',
        hi: 'ज्ञान-प्रेरित करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:jupiter',
        tradition: 'project-defined',
      },
      venus: {
        en: 'The Harmonious Compassionate Visionary',
        hi: 'सामंजस्यपूर्ण करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:venus',
        tradition: 'project-defined',
      },
      saturn: {
        en: 'The Disciplined Compassionate Visionary',
        hi: 'अनुशासित करुणामय दूरदर्शी',
        sourceRule: 'partial:moon:pisces + ak:saturn',
        tradition: 'project-defined',
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/* SUN ELEMENT LOOKUP                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Deterministic classification used ONLY by partial-profile archetypes.
 *
 * Classical foundation:
 * - Fire signs: Aries, Leo, Sagittarius
 * - Earth signs: Taurus, Virgo, Capricorn
 * - Air signs: Gemini, Libra, Aquarius
 * - Water signs: Cancer, Scorpio, Pisces
 *
 * The element classification itself is classical;
 * the downstream archetype naming is project-defined.
 */
export const SIGN_ELEMENT: Record<ZodiacSign, Element> = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
};

/* -------------------------------------------------------------------------- */
/* PARTIAL PROFILE — STRENGTHS & GROWTH EDGES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Dedicated Moon-derived strengths & growth edges for partial profiles.
 * Used exclusively when Lagna is unavailable.
 */
export const PARTIAL_STRENGTH_RULES: Record<
  ZodiacSign,
  {
    moonStrength: StrengthRule;
    growthEdges: [GrowthEdgeRule, GrowthEdgeRule];
  }
> = {
  aries: {
    moonStrength: {
      en: 'Responds to life with emotional courage, authenticity and directness',
      hi: 'जीवन में भावनात्मक साहस, स्पष्टवादिता और स्वाभाविकता से प्रतिक्रिया देते हैं',
      sourceRule: 'partial:moon:aries + strength:emotional_courage',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from allowing emotional reactions to cool before making firm commitments',
        hi: 'दृढ़ निर्णय लेने से पहले तात्कालिक भावनात्मक प्रतिक्रिया को शांत होने देना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:aries + growth:emotional_patience',
        tradition: 'project-defined',
      },
      {
        en: 'May need to listen to subtle feelings rather than rushing to immediate action',
        hi: 'तत्काल कदम उठाने के बजाय अपनी सूक्ष्म भावनाओं को सुनना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:aries + growth:emotional_listening',
        tradition: 'project-defined',
      },
    ],
  },

  taurus: {
    moonStrength: {
      en: 'Offers deep emotional stability, constancy and calming reassurance',
      hi: 'गहरी भावनात्मक स्थिरता, निरंतरता और शांत ढांढस प्रदान करते हैं',
      sourceRule: 'partial:moon:taurus + strength:emotional_stability',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from adapting to emotional shifts without feeling destabilized',
        hi: 'भावनात्मक बदलावों से असहज हुए बिना उनके अनुकूल होना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:taurus + growth:adaptability',
        tradition: 'project-defined',
      },
      {
        en: 'May need to express inner feelings rather than quietly holding onto comfort zones',
        hi: 'केवल अपनी सुविधा में बने रहने के बजाय भीतर की भावनाओं को व्यक्त करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:taurus + growth:express_feelings',
        tradition: 'project-defined',
      },
    ],
  },

  gemini: {
    moonStrength: {
      en: 'Processes feelings through intellectual inquiry, communication and mental adaptability',
      hi: 'विचार-विमर्श, संवाद और मानसिक लचीलेपन के माध्यम से भावनाओं को समझते हैं',
      sourceRule: 'partial:moon:gemini + strength:mental_adaptability',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from sitting with deep emotions instead of intellectualizing them away',
        hi: 'गहरी भावनाओं को केवल तार्किक रूप से देखने के बजाय उन्हें अनुभव करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:gemini + growth:feel_not_intellectualize',
        tradition: 'project-defined',
      },
      {
        en: 'May need to quiet mental restlessness during quiet reflective moments',
        hi: 'शांत चिंतन के समय मन की चंचलता को विराम देना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:gemini + growth:quiet_mind',
        tradition: 'project-defined',
      },
    ],
  },

  cancer: {
    moonStrength: {
      en: 'Possesses profound empathy, instinctual caring and emotional protective warmth',
      hi: 'गहन संवेदनशीलता, सहज देखभाल और भावनात्मक सुरक्षात्मक स्नेह रखते हैं',
      sourceRule: 'partial:moon:cancer + strength:deep_empathy',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from setting healthy emotional boundaries to avoid absorbing others burdens',
        hi: 'दूसरों के भावनात्मक बोझ को अपने ऊपर लेने से बचने के लिए स्वस्थ सीमाएं तय करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:cancer + growth:boundaries',
        tradition: 'project-defined',
      },
      {
        en: 'May need to communicate hurt feelings directly rather than retreating into silence',
        hi: 'खिन्न होने पर मौन हो जाने के बजाय अपनी बात को स्पष्ट रूप से साझा करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:cancer + growth:direct_communication',
        tradition: 'project-defined',
      },
    ],
  },

  leo: {
    moonStrength: {
      en: 'Radiates generous warmth, loyalty and sincere emotional encouragement',
      hi: 'उदार स्नेह, निष्ठा और सच्चे दिल से भावनात्मक प्रेरणा का संचार करते हैं',
      sourceRule: 'partial:moon:leo + strength:generous_loyalty',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from validating ones own worth without seeking continuous external reassurance',
        hi: 'बाहरी प्रशंसा की निरंतर अपेक्षा किए बिना अपने आंतरिक मूल्य को पहचानना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:leo + growth:self_validation',
        tradition: 'project-defined',
      },
      {
        en: 'May need to allow vulnerability without fearing a loss of dignity',
        hi: 'गरिमा खोने के भय के बिना अपनी संवेदनशील भावनाओं को स्वीकार करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:leo + growth:vulnerability',
        tradition: 'project-defined',
      },
    ],
  },

  virgo: {
    moonStrength: {
      en: 'Demonstrates care through practical helpfulness, observant discernment and thoughtful service',
      hi: 'व्यावहारिक सहायता, सजग विवेक और विचारशील सेवा-भाव के माध्यम से अपनापन व्यक्त करते हैं',
      sourceRule: 'partial:moon:virgo + strength:practical_care',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from softening inner self-critique when circumstances are less than perfect',
        hi: 'परिस्थितियां पूर्ण न होने पर भी स्वयं के प्रति अत्यधिक आलोचनात्मक रवैये को नरम करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:virgo + growth:gentle_self_view',
        tradition: 'project-defined',
      },
      {
        en: 'May need to trust intuition without needing to verify every emotional nuance',
        hi: 'हर भावना को तार्किक कसौटी पर परखने के बजाय सहज अंतर्ज्ञान पर भरोसा करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:virgo + growth:trust_intuition',
        tradition: 'project-defined',
      },
    ],
  },

  libra: {
    moonStrength: {
      en: 'Fosters peaceful coexistence, emotional fairness and gracious interpersonal harmony',
      hi: 'शांतिपूर्ण सह-अस्तित्व, भावनात्मक निष्पक्षता और सौहार्दपूर्ण सामंजस्य का वातावरण बनाते हैं',
      sourceRule: 'partial:moon:libra + strength:interpersonal_harmony',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from acknowledging difficult truths even when they disrupt temporary peace',
        hi: 'अस्थायी शांति भंग होने के डर के बिना भी आवश्यक सत्यों को स्वीकार करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:libra + growth:honest_confrontation',
        tradition: 'project-defined',
      },
      {
        en: 'May need to prioritize personal emotional needs alongside those of partners',
        hi: 'दूसरों की भावनाओं का सम्मान करते हुए अपनी आवश्यकताओं को भी प्राथमिकता देना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:libra + growth:personal_needs',
        tradition: 'project-defined',
      },
    ],
  },

  scorpio: {
    moonStrength: {
      en: 'Carries transformative emotional depth, unwavering loyalty and penetrating insight',
      hi: 'गहन भावनात्मक रूपांतरण, अटूट निष्ठा और मर्मवेधी समझ की क्षमता रखते हैं',
      sourceRule: 'partial:moon:scorpio + strength:penetrating_insight',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from gently releasing emotional vigilance and trusting safe connections',
        hi: 'लगातार सतर्क रहने के बजाय सुरक्षित संबंधों में सहज विश्वास दिखाना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:scorpio + growth:release_vigilance',
        tradition: 'project-defined',
      },
      {
        en: 'May need to forgive past emotional wounds to free up creative vitality',
        hi: 'रचनात्मक ऊर्जा को मुक्त करने के लिए पुरानी भावनात्मक चोटों को क्षमापूर्वक छोड़ना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:scorpio + growth:forgiveness',
        tradition: 'project-defined',
      },
    ],
  },

  sagittarius: {
    moonStrength: {
      en: 'Nurtures uplifting faith, open-minded optimism and a love for wisdom and truth',
      hi: 'उत्साहवर्धक विश्वास, खुले मन की आशावादिता और ज्ञान व सत्य के प्रति निष्ठा का पोषण करते हैं',
      sourceRule: 'partial:moon:sagittarius + strength:uplifting_faith',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from honoring immediate emotional details instead of solely looking to the horizon',
        hi: 'केवल दूर के क्षितिज को देखने के बजाय वर्तमान की भावनात्मक सच्चाइयों को भी सम्मान देना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:sagittarius + growth:present_focus',
        tradition: 'project-defined',
      },
      {
        en: 'May need to temper blunt honesty with compassionate delivery',
        hi: 'सीधी और खरी बात कहते समय उसमें संवेदनशीलता और विनम्रता का पुट जोड़ना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:sagittarius + growth:tactful_speech',
        tradition: 'project-defined',
      },
    ],
  },

  capricorn: {
    moonStrength: {
      en: 'Provides grounded emotional maturity, self-reliance and enduring emotional resilience',
      hi: 'परिपक्व भावनात्मक संतुलन, आत्मनिर्भरता और स्थायी धैर्य प्रदान करते हैं',
      sourceRule: 'partial:moon:capricorn + strength:emotional_resilience',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from allowing oneself to experience joy and warmth without conditional duty',
        hi: 'केवल कर्तव्य तक सीमित रहने के बजाय स्वयं को सहज आनंद और स्नेह का अनुभव करने देना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:capricorn + growth:allow_joy',
        tradition: 'project-defined',
      },
      {
        en: 'May need to share burdens with trusted peers instead of carrying everything in isolation',
        hi: 'अकेले सब कुछ संभालने के बजाय विश्वसनीय मित्रों के साथ जिम्मेदारियां साझा करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:capricorn + growth:share_burdens',
        tradition: 'project-defined',
      },
    ],
  },

  aquarius: {
    moonStrength: {
      en: 'Maintains humanitarian perspective, intellectual objectivity and emotional freedom',
      hi: 'मानवीय दृष्टिकोण, बौद्धिक निष्पक्षता और व्यक्तिगत स्वाधीनता बनाए रखते हैं',
      sourceRule: 'partial:moon:aquarius + strength:humanitarian_objectivity',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from connecting on intimate personal levels rather than remaining purely conceptual',
        hi: 'केवल वैचारिक स्तर पर रहने के बजाय व्यक्तिगत व आत्मीय स्तर पर जुड़ना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:aquarius + growth:intimate_connection',
        tradition: 'project-defined',
      },
      {
        en: 'May need to accept unconventional emotions without feeling alienated',
        hi: 'अपनी विशिष्ट भावनाओं को बिना किसी अलगाव के भाव के सहजता से स्वीकार करना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:aquarius + growth:accept_emotions',
        tradition: 'project-defined',
      },
    ],
  },

  pisces: {
    moonStrength: {
      en: 'Channels boundless compassion, spiritual intuition and creative artistic sensitivity',
      hi: 'असीम करुणा, आध्यात्मिक अंतर्ज्ञान और रचनात्मक संवेदनशीलता का संचार करते हैं',
      sourceRule: 'partial:moon:pisces + strength:boundless_compassion',
      tradition: 'project-defined',
    },
    growthEdges: [
      {
        en: 'May benefit from grounding idealistic dreams into structured daily routines',
        hi: 'आदर्शवादी सपनों को दैनिक जीवन के व्यावहारिक अनुशासन में ढालना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:pisces + growth:ground_dreams',
        tradition: 'project-defined',
      },
      {
        en: 'May need to differentiate between healthy compassion and emotional overwhelm',
        hi: 'सच्ची करुणा और अत्यधिक भावनात्मक संवेदनशीलता के बीच स्पष्ट भेद समझना लाभकारी हो सकता है',
        sourceRule: 'partial:moon:pisces + growth:discern_overwhelm',
        tradition: 'project-defined',
      },
    ],
  },
};

/**
 * Partial profile Sun element secondary strength.
 * Participates as Strength 2 in partial mode.
 */
export const PARTIAL_SUN_STRENGTHS: Record<Element, StrengthRule> = {
  fire: {
    en: 'Brings natural vitality, creative passion and initiative to personal pursuits',
    hi: 'व्यक्तिगत प्रयासों में स्वाभाविक ऊर्जा, रचनात्मक उत्साह और पहल करने की क्षमता लाते हैं',
    sourceRule: 'partial:sun_element:fire + strength:creative_vitality',
    tradition: 'project-defined',
  },
  earth: {
    en: 'Approaches life with practical realism, reliability and constructive focus',
    hi: 'जीवन को व्यावहारिक यथार्थवाद, विश्वसनीयता और रचनात्मक एकाग्रता के साथ देखते हैं',
    sourceRule: 'partial:sun_element:earth + strength:practical_realism',
    tradition: 'project-defined',
  },
  air: {
    en: 'Engages the world through intellectual curiosity, mental agility and social connection',
    hi: 'बौद्धिक जिज्ञासा, मानसिक सजगता और सामाजिक संपर्कों के माध्यम से दुनिया से जुड़ते हैं',
    sourceRule: 'partial:sun_element:air + strength:mental_agility',
    tradition: 'project-defined',
  },
  water: {
    en: 'Navigates circumstances with emotional depth, empathy and intuitive awareness',
    hi: 'गहरी भावनात्मक समझ, संवेदनशीलता और सहज ज्ञान से परिस्थितियों को दिशा देते हैं',
    sourceRule: 'partial:sun_element:water + strength:intuitive_depth',
    tradition: 'project-defined',
  },
};

/* -------------------------------------------------------------------------- */
/* LIFE ORIENTATION                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Project-defined synthesis.
 *
 * Coarse orientation classification based on classical sign mobility & quadruplicity.
 */
export const LIFE_ORIENTATION_BY_LAGNA: Record<
  ZodiacSign,
  'introverted_reflective' | 'ambiverted' | 'dynamic_external'
> = {
  aries: 'dynamic_external',
  taurus: 'ambiverted',
  gemini: 'dynamic_external',
  cancer: 'introverted_reflective',
  leo: 'dynamic_external',
  virgo: 'introverted_reflective',
  libra: 'ambiverted',
  scorpio: 'introverted_reflective',
  sagittarius: 'dynamic_external',
  capricorn: 'ambiverted',
  aquarius: 'ambiverted',
  pisces: 'introverted_reflective',
};

/**
 * Partial-profile orientation.
 *
 * Uses Moon sign because Lagna is unavailable.
 */
export const LIFE_ORIENTATION_BY_MOON: Record<
  ZodiacSign,
  'introverted_reflective' | 'ambiverted' | 'dynamic_external'
> = {
  aries: 'dynamic_external',
  taurus: 'ambiverted',
  gemini: 'dynamic_external',
  cancer: 'introverted_reflective',
  leo: 'dynamic_external',
  virgo: 'introverted_reflective',
  libra: 'ambiverted',
  scorpio: 'introverted_reflective',
  sagittarius: 'dynamic_external',
  capricorn: 'ambiverted',
  aquarius: 'ambiverted',
  pisces: 'introverted_reflective',
};

/**
 * Standard single-sentence explanations for life orientation.
 */
export const ORIENTATION_DESCRIPTIONS: Record<
  'introverted_reflective' | 'ambiverted' | 'dynamic_external',
  LocalizedPhrase
> = {
  introverted_reflective: {
    en: 'Tends to process experiences internally before taking action, drawing energy from quiet reflection and focused contemplation.',
    hi: 'कार्य करने से पहले अनुभवों को आंतरिक रूप से संसाधित करने की प्रवृत्ति रखते हैं, और शांत चिंतन से ऊर्जा प्राप्त करते हैं।',
  },
  ambiverted: {
    en: 'Balances thoughtful self-reflection with practical engagement in the external world depending on the situation.',
    hi: 'परिस्थिति के अनुसार विचारशील आत्म-मंथन और बाहरी दुनिया में व्यावहारिक सहभागिता के बीच संतुलन बनाते हैं।',
  },
  dynamic_external: {
    en: 'Naturally directs energy outward through decisive action, expressive communication, and proactive engagement with life.',
    hi: 'निर्णायक कर्म, स्पष्ट अभिव्यक्ति और जीवन में सक्रिय सहभागिता के माध्यम से ऊर्जा को स्वाभाविक रूप से बाहर की ओर प्रवाहित करते हैं।',
  },
};
