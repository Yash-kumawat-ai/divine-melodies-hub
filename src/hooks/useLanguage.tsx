import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'bn' | 'ta';

type TranslationKey =
  | 'home'
  | 'browse'
  | 'recent'
  | 'trending'
  | 'search'
  | 'upload'
  | 'login'
  | 'signUp'
  | 'logout'
  | 'profile'
  | 'accountMenu'
  | 'devoteeProfile'
  | 'signedInDevotee'
  | 'guestDevotee'
  | 'manageDevotion'
  | 'uploading'
  | 'setPhoto'
  | 'language'
  | 'more'
  | 'features'
  | 'addBhajan'
  | 'shareCommunity'
  | 'god'
  | 'lyrics'
  | 'details'
  | 'selectGodForBhajan'
  | 'addAnotherGod'
  | 'addDeityHint'
  | 'changeGod'
  | 'bhajansCount'
  | 'allBhajans'
  | 'browseOurCollection'
  | 'findLyricsAndMeaning'
  | 'bhajansSandhya'
  | 'completeDevotionalMusic'
  | 'footerTagline'
  | 'featuredBhajans'
  | 'popularBhajans'
  | 'communityBhajans'
  | 'sharedByOurCommunity'
  | 'allDeities'
  | 'exploreDeities'
  | 'browseByDeity'
  | 'devotionalSongs'
  | 'recentBhajans'
  | 'latestUploads'
  | 'trending'
  | 'trendingHour'
  | 'trendingDaily'
  | 'trendingWeekly'
  | 'trendingAllTime'
  | 'plays'
  | 'rating'
  | 'play'
  | 'viewDetails'
  | 'noResults'
  | 'tryAdjustingFilters'
  | 'allRatings'
  | 'stars'
  | 'latest'
  | 'mostPlayed'
  | 'highestRated'
  | 'sortBy'
  | 'filterByDeity'
  | 'clearFilters'
  | 'showing'
  | 'of'
  | 'notifications'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'copyLink'
  | 'copied'
  | 'deity'
  | 'singer'
  | 'tags'
  | 'relatedBhajans'
  | 'shareOnWhatsapp'
  | 'shareOnTelegram'
  | 'shareViaEmail'
  | 'copyShareLink'
  | 'linkCopied'
  | 'kirtanAi'
  | 'elderlyAssistant'
  | 'uploadBhajan'
  | 'adminModeration'
  | 'adminAccounts'
  | 'auditLog'
  | 'admin'
  | 'setProfilePhoto'
  | 'back'
  | 'new'
  | 'browseAllBhajans'
  | 'allDeitiesSubtitle'
  | 'searchBhajansOrSingers'
  | 'searchHint'
  | 'browseAllBhajansSubtitle'
  | 'allLanguages'
  | 'allOccasions'
  | 'allMoods'
  | 'morning'
  | 'evening'
  | 'meditation'
  | 'community'
  | 'panchang'
  | 'temple'
  | 'templeTitle'
  | 'templeSubtitle'
  | 'templePresence'
  | 'templeDays'
  | 'templeFlower'
  | 'templeBell'
  | 'templeDiya'
  | 'templeJapa'
  | 'templeNaradHint'
  | 'templeBhajans'
  | 'templeNoDeity'
  | 'worship'
  | 'festival'
  | 'peaceful'
  | 'energizing'
  | 'devotional'
  | 'celebratory'
  | 'meditative'
  | 'searchBhajansOrSingersPlaceholder'
  | 'noBhajansFound'
  | 'switchToDarkMode'
  | 'switchToLightMode'
  // Navbar / Header
  | 'pricing'
  | 'about'
  // Home page
  | 'discoverThe'
  | 'divine'
  | 'heroSubtitle'
  | 'browseBhajans'
  | 'uploadYours'
  | 'bhajans'
  | 'artists'
  | 'listeners'
  | 'whyRaghavam'
  | 'uploadAndShare'
  | 'uploadAndShareDesc'
  | 'discoverBhajans'
  | 'discoverBhajansDesc'
  | 'communityDriven'
  | 'communityDrivenDesc'
  | 'curatedQuality'
  | 'curatedQualityDesc'
  | 'lovedByDevotees'
  | 'joinThousands'
  | 'joinThousandsSubtitle'
  | 'getStartedFree'
  // Pricing page
  | 'simpleHonestPricing'
  | 'choosePlan'
  | 'monthly'
  | 'annual'
  | 'save20'
  | 'mostPopular'
  | 'free'
  | 'devotee'
  | 'seva'
  | 'getStarted'
  | 'subscribe'
  | 'perMonth'
  | 'perYear'
  | 'billedAnnually'
  | 'faq'
  | 'browseBhajansFeature'
  | 'uploadLimit3'
  | 'uploadUnlimited'
  | 'priorityReview'
  | 'devoteeBadge'
  | 'exclusiveBhajans'
  | 'supportPlatform'
  | 'earlyAccess'
  // About page
  | 'ourMission'
  | 'ourValues'
  | 'meetTheFounder'
  | 'founderAndDeveloper'
  | 'ourStory'
  | 'getInTouch'
  | 'getInTouchSubtitle'
  | 'emailUs'
  | 'devotionValue'
  | 'devotionValueDesc'
  | 'authenticityValue'
  | 'authenticityValueDesc'
  | 'communityValue'
  | 'communityValueDesc'
  | 'sevaValue'
  | 'sevaValueDesc'
  // Footer
  | 'footerDescription'
  | 'emailForUpdates'
  | 'explore'
  | 'footerCommunity'
  | 'legal'
  | 'privacyPolicy'
  | 'termsOfService'
  | 'cookiePolicy'
  | 'madeWithDevotion'
  // Legal
  | 'lastUpdated'
  // Misc
  | 'loading'
  | 'somethingWentWrong'
  | 'goHome'
  | 'refreshPage'
  | 'myProfile'
  | 'editProfile'
  | 'likedBhajans'
  | 'savedPosts'
  | 'ourSevaPlan'
  | 'helpSupport'
  | 'currentPlan'
  | 'viewPlans'
  | 'noLikedBhajans'
  | 'signInToLike'
  | 'sevaPlanBlurb'
  | 'openAccount'
  | 'saveProfile'
  | 'phoneNumber'
  | 'emailReadOnly'
  | 'profileUpdated'
  | 'supportTitle'
  | 'supportIntro'
  | 'contactSupport'
  | 'myAccount'
  | 'freePlan'
  | 'likeBhajan'
  | 'unlikeBhajan'
  | 'profileSection'
  | 'accountSettings'
  | 'displayName'
  | 'accountDetails'
  | 'changePhoto'
  | 'cancelEdit'
  | 'quickLinks'
  | 'notSet'
  | 'languagePreference';

const translations: Record<SupportedLanguage, Partial<Record<TranslationKey, string>>> = {
  en: {
    home: 'Home',
    browse: 'Bhajans',
    recent: 'Recent',
    trending: 'Trending',
    search: 'Search',
    upload: 'Upload',
    login: 'Log in',
    signUp: 'Sign up',
    logout: 'Log out',
    profile: 'Profile',
    accountMenu: 'Account menu',
    devoteeProfile: 'Devotee Profile',
    signedInDevotee: 'Signed in devotee',
    guestDevotee: 'Guest devotee',
    manageDevotion: 'Manage your devotional journey',
    uploading: 'Uploading...',
    setPhoto: 'Set profile photo',
    language: 'Language',
    more: 'More',
    features: 'Features',
    addBhajan: 'Add Bhajan',
    shareCommunity: 'Share your favorite devotional songs with our community',
    god: 'God',
    lyrics: 'Lyrics',
    details: 'Details',
    selectGodForBhajan: 'Select God for Bhajan',
    addAnotherGod: 'Add Another God',
    addDeityHint: 'Add a deity not in the list',
    changeGod: 'Change God',
    bhajansCount: 'Bhajans',
    allBhajans: 'All Bhajans',
    browseOurCollection: 'Explore our collection of sacred songs, stotrams, and mantras',
    findLyricsAndMeaning: 'Find the lyrics and meaning for your daily devotion',
    bhajansSandhya: 'Raghavam',
    completeDevotionalMusic: 'Your complete Raghavam collection — lyrics, audio & more',
    footerTagline: 'Raghavam — your treasury of devotional music',
    featuredBhajans: 'Featured Bhajans',
    popularBhajans: 'Popular Bhajans',
    communityBhajans: 'Community Bhajans',
    sharedByOurCommunity: 'Shared by our community of devotees',
    allDeities: 'All Deities',
    exploreDeities: 'Explore the divine across traditions and stories',
    browseByDeity: 'Explore by Deity',
    devotionalSongs: 'Find bhajans by deity',
    recentBhajans: 'Recent Bhajans',
    latestUploads: 'Latest uploads from our community',
    trendingHour: 'Trending This Hour',
    trendingDaily: 'Trending Today',
    trendingWeekly: 'Trending This Week',
    trendingAllTime: 'All Time Trending',
    plays: 'plays',
    rating: 'rating',
    play: 'Play',
    viewDetails: 'View Details',
    noResults: 'No bhajans found',
    tryAdjustingFilters: 'Try adjusting your filters or search terms',
    allRatings: 'All Ratings',
    stars: 'Stars',
    latest: 'Latest',
    mostPlayed: 'Most Played',
    highestRated: 'Highest Rated',
    sortBy: 'Sort By',
    filterByDeity: 'Filter By Deity',
    clearFilters: 'Clear',
    showing: 'Showing',
    of: 'of',
    notifications: 'Notifications',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Email',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    deity: 'Deity',
    singer: 'Singer',
    tags: 'Tags',
    relatedBhajans: 'Related Bhajans',
    shareOnWhatsapp: 'Share on WhatsApp',
    shareOnTelegram: 'Share on Telegram',
    shareViaEmail: 'Share via Email',
    copyShareLink: 'Copy link',
    linkCopied: 'Link copied!',
    kirtanAi: 'Kirtan AI',
    elderlyAssistant: 'Elderly Assistant',
    uploadBhajan: 'Upload',
    adminModeration: 'Moderation Queue',
    adminAccounts: 'Admin Accounts',
    auditLog: 'Audit Log',
    admin: 'Admin',
    setProfilePhoto: 'Set profile photo',
    back: 'Back',
    new: 'New',
    browseAllBhajans: 'Explore All Bhajans',
    allDeitiesSubtitle: 'View bhajans by all deities',
    searchBhajansOrSingers: 'Search bhajans or singers...',
    searchHint: 'Search bhajans, deities, or singers • Search in Hindi or English • Voice supported',
    browseAllBhajansSubtitle: 'Explore our complete devotional music collection with filters and search',
    allLanguages: 'All Languages',
    allOccasions: 'All Occasions',
    allMoods: 'All Moods',
    morning: 'Morning',
    evening: 'Evening',
    meditation: 'Meditation',
    community: 'Community',
    panchang: 'Panchang',
    temple: 'Temple',
    templeTitle: 'Virtual Temple',
    templeSubtitle: 'Darshan, offerings, and japa — at home',
    templePresence: 'Your presence',
    templeDays: 'days',
    templeFlower: 'Flower',
    templeBell: 'Bell',
    templeDiya: 'Diya',
    templeJapa: '108 Japa',
    templeNaradHint: 'Or tap the ॐ button (bottom-right) and speak to Narad — play bhajan, start japa, offer flower.',
    templeBhajans: 'Bhajans for this deity',
    templeNoDeity: 'Deity images are loading. Browse all deities:',
    worship: 'Worship',
    festival: 'Festival',
    peaceful: 'Peaceful',
    energizing: 'Energizing',
    devotional: 'Devotional',
    celebratory: 'Celebratory',
    meditative: 'Meditative',
    searchBhajansOrSingersPlaceholder: 'Search bhajans or singers...',
    noBhajansFound: 'No bhajans found',
    switchToDarkMode: 'Switch to Dark Mode',
    switchToLightMode: 'Switch to Light Mode',
    // Navbar
    pricing: 'Pricing',
    about: 'About',
    // Home
    discoverThe: 'Discover the',
    divine: 'Divine',
    heroSubtitle: 'The largest community-driven collection of Hindu devotional music. Explore, listen, and share bhajans with devotees worldwide.',
    browseBhajans: 'Bhajans',
    uploadYours: 'Upload Yours',
    bhajans: 'Bhajans',
    artists: 'Artists',
    listeners: 'Listeners',
    whyRaghavam: 'Why Raghavam?',
    uploadAndShare: 'Upload & Share',
    uploadAndShareDesc: 'Share your favorite bhajans with the community in minutes.',
    discoverBhajans: 'Discover Bhajans',
    discoverBhajansDesc: 'Find devotional songs by deity, singer, language, or mood.',
    communityDriven: 'Community Driven',
    communityDrivenDesc: 'Join thousands of devotees preserving our musical heritage.',
    curatedQuality: 'Curated Quality',
    curatedQualityDesc: 'Every submission is reviewed for accuracy before publishing.',
    lovedByDevotees: 'Loved by Devotees',
    joinThousands: 'Join Thousands of Devotees',
    joinThousandsSubtitle: 'Start exploring the divine world of bhajans. Create a free account and begin your journey.',
    getStartedFree: 'Get Started Free',
    // Pricing
    simpleHonestPricing: 'Simple, Honest Pricing',
    choosePlan: 'Choose the plan that fits your devotional journey. All prices in INR.',
    monthly: 'Monthly',
    annual: 'Annual',
    save20: 'Save 20%',
    mostPopular: 'Most Popular',
    free: 'Free',
    devotee: 'Devotee',
    seva: 'Seva',
    getStarted: 'Get Started',
    subscribe: 'Subscribe',
    perMonth: '/month',
    perYear: '/year',
    billedAnnually: 'billed annually',
    faq: 'Frequently Asked Questions',
    browseBhajansFeature: 'Bhajans',
    uploadLimit3: 'Upload bhajans (3/month)',
    uploadUnlimited: 'Upload bhajans (Unlimited)',
    priorityReview: 'Priority review',
    devoteeBadge: 'Devotee badge',
    exclusiveBhajans: 'Exclusive bhajans',
    supportPlatform: 'Support the platform',
    earlyAccess: 'Early access',
    // About
    ourMission: 'Our Mission',
    ourValues: 'Our Values',
    meetTheFounder: 'Meet the Founder',
    founderAndDeveloper: 'Founder & Developer',
    ourStory: 'Our Story',
    getInTouch: 'Get in Touch',
    getInTouchSubtitle: 'Have questions, suggestions, or want to contribute? We\'d love to hear from you.',
    emailUs: 'Email Us',
    devotionValue: 'Devotion',
    devotionValueDesc: 'Every feature we build is rooted in reverence for India\'s spiritual traditions.',
    authenticityValue: 'Authenticity',
    authenticityValueDesc: 'We verify lyrics, attribute artists, and preserve the original form of every bhajan.',
    communityValue: 'Community',
    communityValueDesc: 'Built by devotees, for devotees. Every upload enriches our shared heritage.',
    sevaValue: 'Seva',
    sevaValueDesc: 'Service to the devotional arts. Our core features remain free, always.',
    // Footer
    footerDescription: 'Preserving devotion, one bhajan at a time. The largest community-driven collection of Hindu devotional music.',
    emailForUpdates: 'Your email for updates',
    explore: 'Bhajans',
    footerCommunity: 'Community',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    madeWithDevotion: 'Made with devotion in India.',
    // Legal
    lastUpdated: 'Last updated',
    // Misc
    loading: 'Loading...',
    somethingWentWrong: 'Something went wrong',
    goHome: 'Go Home',
    refreshPage: 'Refresh Page',
    myProfile: 'My Profile',
    editProfile: 'Edit profile',
    likedBhajans: 'Liked Bhajans',
    savedPosts: 'Saved Posts',
    ourSevaPlan: 'Our Seva Plan',
    helpSupport: 'Help & Support',
    currentPlan: 'Current plan',
    viewPlans: 'View plans',
    noLikedBhajans: 'No liked bhajans yet. Tap the heart on any bhajan to save it here.',
    signInToLike: 'Sign in to save your favourite bhajans.',
    sevaPlanBlurb: 'Support the platform and unlock more uploads, badges, and early features.',
    openAccount: 'Open account',
    saveProfile: 'Save profile',
    phoneNumber: 'Phone number',
    emailReadOnly: 'Email (cannot be changed here)',
    profileUpdated: 'Profile updated',
    supportTitle: 'Help & Support',
    supportIntro: 'We are here for your devotional journey on Raghavam.',
    contactSupport: 'Email support',
    myAccount: 'My account',
    freePlan: 'Free',
    likeBhajan: 'Like bhajan',
    unlikeBhajan: 'Unlike bhajan',
    profileSection: 'My profile',
    accountSettings: 'Account',
    displayName: 'Display name',
    accountDetails: 'Account details',
    changePhoto: 'Change photo',
    cancelEdit: 'Cancel',
    quickLinks: 'Quick links',
    notSet: 'Not added',
    languagePreference: 'App language',
  },
  hi: {
    accountMenu: 'खाता मेनू',
    devoteeProfile: 'भक्त प्रोफाइल',
    signedInDevotee: 'लॉग इन भक्त',
    guestDevotee: 'अतिथि भक्त',
    manageDevotion: 'अपनी भक्ति यात्रा संभालें',
    uploading: 'अपलोड हो रहा है...',
    home: 'होम',
    browse: 'भजन',
    recent: 'नवीन',
    trending: 'ट्रेंडिंग',
    search: 'खोज',
    upload: 'अपलोड',
    login: 'लॉग इन',
    signUp: 'खाता बनाएं',
    logout: 'लॉग आउट',
    profile: 'प्रोफाइल',
    setPhoto: 'प्रोफाइल फोटो सेट करें',
    language: 'भाषा',
    more: 'और',
    features: 'सुविधाएं',
    addBhajan: 'भजन जोड़ें',
    shareCommunity: 'अपने पसंदीदा भजन समुदाय के साथ साझा करें',
    god: 'भगवान',
    lyrics: 'गीत',
    details: 'विवरण',
    selectGodForBhajan: 'भजन के लिए भगवान चुनें',
    addAnotherGod: 'एक और भगवान जोड़ें',
    addDeityHint: 'सूची में न होने पर नया जोड़ें',
    changeGod: 'भगवान बदलें',
    bhajansCount: 'भजन',
    allBhajans: 'सभी भजन',
    browseOurCollection: 'पवित्र गीतों, स्तोत्रों और मंत्रों का हमारा संग्रह — खोजें',
    findLyricsAndMeaning: 'अपनी दैनिक पूजा के लिए गीतों और अर्थ खोजें',
    bhajansSandhya: 'राघवम्',
    completeDevotionalMusic: 'आपका पूर्ण राघवम् संग्रह — गीत, ऑडियो और अधिक',
    footerTagline: 'राघवम् — आपका भक्ति संगीत का खजाना',
    featuredBhajans: 'विशेष भजन',
    popularBhajans: 'लोकप्रिय भजन',
    communityBhajans: 'समुदाय भजन',
    sharedByOurCommunity: 'समुदाय द्वारा साझा किए गए भजन',
    allDeities: 'सभी देवता',
    exploreDeities: 'परंपराओं और कहानियों के साथ दिव्य की खोज करें',
    browseByDeity: 'देवता के अनुसार खोजें',
    devotionalSongs: 'देवता के अनुसार भजन खोजें',
    recentBhajans: 'हाल के भजन',
    latestUploads: 'हमारे समुदाय से नवीनतम अपलोड',
    trendingHour: 'इस घंटे ट्रेंडिंग',
    trendingDaily: 'आज ट्रेंडिंग',
    trendingWeekly: 'इस हफ्ते ट्रेंडिंग',
    trendingAllTime: 'सभी समय की ट्रेंडिंग',
    plays: 'बार चलाया गया',
    rating: 'रेटिंग',
    play: 'चलाएं',
    viewDetails: 'विवरण देखें',
    noResults: 'कोई भजन नहीं मिला',
    tryAdjustingFilters: 'अपने फ़िल्टर या खोज शर्तों को समायोजित करने का प्रयास करें',
    allRatings: 'सभी रेटिंग',
    stars: 'तारके',
    latest: 'नवीनतम',
    mostPlayed: 'सबसे अधिक चलाया गया',
    highestRated: 'सबसे अधिक रेटेड',
    sortBy: 'इसके द्वारा सॉर्ट करें',
    filterByDeity: 'देवता के अनुसार फ़िल्टर करें',
    clearFilters: 'साफ़ करें',
    showing: 'दिखा रहा है',
    of: 'का',
    notifications: 'सूचनाएं',
    whatsapp: 'व्हाट्सएप',
    telegram: 'टेलीग्राम',
    email: 'ईमेल',
    copyLink: 'लिंक कॉपी करें',
    copied: 'कॉपी किया गया!',
    deity: 'देवता',
    singer: 'गायक',
    tags: 'टैग',
    relatedBhajans: 'संबंधित भजन',
    shareOnWhatsapp: 'व्हाट्सएप पर साझा करें',
    shareOnTelegram: 'टेलीग्राम पर साझा करें',
    shareViaEmail: 'ईमेल के माध्यम से साझा करें',
    copyShareLink: 'लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी किया गया!',
    kirtanAi: 'कीर्तन प्रवाह',
    elderlyAssistant: 'बुजुर्ग सहायक',
    uploadBhajan: 'अपलोड',
    adminModeration: 'संयोजन कतार',
    adminAccounts: 'प्रशासक खाते',
    auditLog: 'ऑडिट लॉग',
    admin: 'प्रशासक',
    setProfilePhoto: 'प्रोफाइल फोटो सेट करें',
    back: 'वापस',
    new: 'नया',
    browseAllBhajans: 'सभी भजन',
    allDeitiesSubtitle: 'सभी देवताओं के भजन देखें',
    searchBhajansOrSingers: 'भजन या गायक खोजें...',
    searchHint: 'भजन, देवता, या गायक खोजें • हिंदी या अंग्रेजी में खोजें • वॉइस सपोर्ट उपलब्ध',
    browseAllBhajansSubtitle: 'फ़िल्टर और खोज के साथ हमारा पूरा भक्तिमय संगीत संग्रह — खोजें',
    allLanguages: 'सभी भाषाएं',
    allOccasions: 'सभी अवसर',
    allMoods: 'सभी भाव',
    morning: 'प्रातः',
    evening: 'संध्या',
    meditation: 'ध्यान',
    community: 'समूह',
    panchang: 'पंचांग',
    temple: 'मंदिर',
    templeTitle: 'वर्चुअल मंदिर',
    templeSubtitle: 'दर्शन, चढ़ावा और जप — घर पर',
    templePresence: 'आपकी उपस्थिति',
    templeDays: 'दिन',
    templeFlower: 'फूल',
    templeBell: 'घंटी',
    templeDiya: 'दीप',
    templeJapa: '108 जप',
    templeNaradHint: 'या नीचे दाएँ ॐ बटन दबाकर नारद से बोलें — भजन, जप, फूल।',
    templeBhajans: 'इस देवता के भजन',
    templeNoDeity: 'देवता लोड हो रही हैं। सभी देवता देखें:',
    worship: 'पूजा',
    festival: 'उत्सव',
    peaceful: 'शांत',
    energizing: 'ऊर्जावान',
    devotional: 'भक्तिमय',
    celebratory: 'उत्सवपूर्ण',
    meditative: 'ध्यानमय',
    searchBhajansOrSingersPlaceholder: 'भजन या गायक खोजें...',
    noBhajansFound: 'कोई भजन नहीं मिला',
    switchToDarkMode: 'डार्क मोड चालू करें',
    switchToLightMode: 'लाइट मोड चालू करें',
    // Navbar
    pricing: 'मूल्य',
    about: 'हमारे बारे में',
    // Home
    discoverThe: 'खोजें',
    divine: 'दिव्य संगीत',
    heroSubtitle: 'हिंदू भक्ति संगीत का सबसे बड़ा समुदाय-संचालित संग्रह। भजन सुनें, गाएं और भक्तों के साथ साझा करें।',
    browseBhajans: 'भजन',
    uploadYours: 'अपना अपलोड करें',
    bhajans: 'भजन',
    artists: 'कलाकार',
    listeners: 'श्रोता',
    whyRaghavam: 'राघवम् क्यों?',
    uploadAndShare: 'अपलोड और साझा करें',
    uploadAndShareDesc: 'अपने पसंदीदा भजन मिनटों में समुदाय के साथ साझा करें।',
    discoverBhajans: 'भजन खोजें',
    discoverBhajansDesc: 'देवता, गायक, भाषा या भाव के अनुसार भजन खोजें।',
    communityDriven: 'समुदाय संचालित',
    communityDrivenDesc: 'हमारी संगीत विरासत को संरक्षित करने वाले हजारों भक्तों से जुड़ें।',
    curatedQuality: 'क्यूरेटेड गुणवत्ता',
    curatedQualityDesc: 'प्रकाशन से पहले हर भजन की सटीकता की समीक्षा की जाती है।',
    lovedByDevotees: 'भक्तों द्वारा प्रिय',
    joinThousands: 'हजारों भक्तों से जुड़ें',
    joinThousandsSubtitle: 'भजनों की दिव्य दुनिया खोजना शुरू करें। मुफ्त खाता बनाएं और अपनी यात्रा शुरू करें।',
    getStartedFree: 'मुफ्त शुरू करें',
    // Pricing
    simpleHonestPricing: 'सरल, ईमानदार मूल्य',
    choosePlan: 'अपनी भक्ति यात्रा के लिए सही योजना चुनें। सभी मूल्य भारतीय रुपये में।',
    monthly: 'मासिक',
    annual: 'वार्षिक',
    save20: '20% बचाएं',
    mostPopular: 'सबसे लोकप्रिय',
    free: 'मुफ्त',
    devotee: 'भक्त',
    seva: 'सेवा',
    getStarted: 'शुरू करें',
    subscribe: 'सदस्यता लें',
    perMonth: '/माह',
    perYear: '/वर्ष',
    billedAnnually: 'वार्षिक बिलिंग',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    browseBhajansFeature: 'भजन खोजें',
    uploadLimit3: 'भजन अपलोड (3/माह)',
    uploadUnlimited: 'भजन अपलोड (असीमित)',
    priorityReview: 'प्राथमिकता समीक्षा',
    devoteeBadge: 'भक्त बैज',
    exclusiveBhajans: 'विशेष भजन',
    supportPlatform: 'मंच का समर्थन करें',
    earlyAccess: 'शीघ्र पहुँच',
    // About
    ourMission: 'हमारा उद्देश्य',
    ourValues: 'हमारे मूल्य',
    meetTheFounder: 'संस्थापक से मिलें',
    founderAndDeveloper: 'संस्थापक और डेवलपर',
    ourStory: 'हमारी कहानी',
    getInTouch: 'संपर्क करें',
    getInTouchSubtitle: 'प्रश्न, सुझाव या योगदान करना चाहते हैं? हमें आपसे सुनकर खुशी होगी।',
    emailUs: 'ईमेल करें',
    devotionValue: 'भक्ति',
    devotionValueDesc: 'हम जो भी बनाते हैं वह भारत की आध्यात्मिक परंपराओं के प्रति श्रद्धा पर आधारित है।',
    authenticityValue: 'प्रामाणिकता',
    authenticityValueDesc: 'हम गीतों की पुष्टि करते हैं, कलाकारों का श्रेय देते हैं, और हर भजन के मूल रूप को संरक्षित करते हैं।',
    communityValue: 'समुदाय',
    communityValueDesc: 'भक्तों द्वारा, भक्तों के लिए बनाया गया। हर अपलोड हमारी साझा विरासत को समृद्ध करता है।',
    sevaValue: 'सेवा',
    sevaValueDesc: 'भक्ति कलाओं की सेवा। हमारी मुख्य सुविधाएं हमेशा मुफ्त रहेंगी।',
    // Footer
    footerDescription: 'एक-एक भजन से भक्ति को संरक्षित करना। हिंदू भक्ति संगीत का सबसे बड़ा समुदाय-संचालित संग्रह।',
    emailForUpdates: 'अपडेट के लिए ईमेल',
    explore: 'भजन',
    footerCommunity: 'समुदाय',
    legal: 'कानूनी',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    cookiePolicy: 'कुकी नीति',
    madeWithDevotion: 'भारत में भक्ति से बनाया गया।',
    // Legal
    lastUpdated: 'अंतिम अपडेट',
    // Misc
    loading: 'लोड हो रहा है...',
    somethingWentWrong: 'कुछ गलत हो गया',
    goHome: 'होम जाएं',
    refreshPage: 'पेज रिफ्रेश करें',
    myProfile: 'मेरा प्रोफाइल',
    editProfile: 'प्रोफाइल संपादित करें',
    likedBhajans: 'पसंदीदा भजन',
    savedPosts: 'सहेजे गए पोस्ट',
    ourSevaPlan: 'हमारी सेवा योजना',
    helpSupport: 'सहायता',
    currentPlan: 'वर्तमान योजना',
    viewPlans: 'योजनाएं देखें',
    noLikedBhajans: 'अभी कोई पसंदीदा भजन नहीं। किसी भी भजन पर दिल दबाकर यहाँ सहेजें।',
    signInToLike: 'पसंदीदा भजन सहेजने के लिए लॉग इन करें।',
    sevaPlanBlurb: 'प्लेटफॉर्म का समर्थन करें और अधिक अपलोड व सुविधाएं पाएं।',
    openAccount: 'खाता खोलें',
    saveProfile: 'प्रोफाइल सहेजें',
    phoneNumber: 'फ़ोन नंबर',
    emailReadOnly: 'ईमेल (यहाँ बदला नहीं जा सकता)',
    profileUpdated: 'प्रोफाइल अपडेट हो गई',
    supportTitle: 'सहायता',
    supportIntro: 'राघवम् पर आपकी भक्ति यात्रा के लिए हम यहाँ हैं।',
    contactSupport: 'ईमेल सहायता',
    myAccount: 'मेरा खाता',
    freePlan: 'मुफ्त',
    likeBhajan: 'भजन पसंद करें',
    unlikeBhajan: 'पसंद हटाएं',
    profileSection: 'मेरा प्रोफाइल',
    accountSettings: 'खाता',
    displayName: 'नाम',
    accountDetails: 'खाता विवरण',
    changePhoto: 'फोटो बदलें',
    cancelEdit: 'रद्द करें',
    quickLinks: 'शीघ्र लिंक',
    notSet: 'जोड़ा नहीं',
    languagePreference: 'ऐप भाषा',
  },
  gu: {
    home: 'હોમ', browse: 'અન્વેષણ', trending: 'ટ્રેન્ડિંગ', search: 'શોધો',
    upload: 'અપલોડ', login: 'લોગ ઇન', logout: 'લોગ આઉટ', profile: 'પ્રોફાઇલ',
    setPhoto: 'પ્રોફાઇલ ફોટો સેટ કરો', language: 'ભાષા', more: 'વધુ', features: 'સુવિધાઓ', addBhajan: 'ભજન ઉમેરો', back: 'પાછા',
    shareCommunity: 'તમારા પ્રિય ભજન સમાજ સાથે શેર કરો', god: 'ભગવાન',
    lyrics: 'ગીત', details: 'વિગતો', selectGodForBhajan: 'ભજન માટે ભગવાન પસંદ કરો',
    addAnotherGod: 'બીજા ભગવાન ઉમેરો', addDeityHint: 'યાદીમાં ન હોય તો ઉમેરો',
    changeGod: 'ભગવાન બદલો', bhajansCount: 'ભજનો',
    recent: 'તાજેતરનાં', meditation: 'ધ્યાન', community: 'સમુદાય', temple: 'મંદિર', kirtanAi: 'કીર્તન AI',
    notifications: 'સૂચનાઓ', switchToDarkMode: 'ડાર્ક મોડ ચાલુ કરો', switchToLightMode: 'લાઇટ મોડ ચાલુ કરો',
    pricing: 'કિંમત', about: 'અમારા વિશે',
  },
  mr: {
    home: 'मुख्यपृष्ठ', browse: 'खोजी', trending: 'ट्रेंडिंग', search: 'शोधा',
    upload: 'अपलोड', login: 'लॉग इन', logout: 'लॉग आउट', profile: 'प्रोफाइल',
    setPhoto: 'प्रोफाइल फोटो सेट करा', language: 'भाषा', more: 'अधिक', features: 'सुविधा', addBhajan: 'भजन जोडा', back: 'मागे',
    shareCommunity: 'तुमची आवडती भजने समुदायासोबत शेअर करा', god: 'देव',
    lyrics: 'गीत', details: 'तपशील', selectGodForBhajan: 'भजनासाठी देव निवडा',
    addAnotherGod: 'आणखी एक देव जोडा', addDeityHint: 'यादीत नसल्यास नवीन जोडा',
    changeGod: 'देव बदला', bhajansCount: 'भजने',
    recent: 'अलीकडील', meditation: 'ध्यान', community: 'समूह', temple: 'मंदिर', kirtanAi: 'कीर्तन AI',
    notifications: 'सूचना', switchToDarkMode: 'डार्क मोड चालू करा', switchToLightMode: 'लाइट मोड चालू करा',
    pricing: 'किंमत', about: 'आमच्याबद्दल',
  },
  bn: {
    home: 'হোম', browse: 'অন্বেষণ', trending: 'ট্রেন্ডিং', search: 'খুঁজুন',
    upload: 'আপলোড', login: 'লগ ইন', logout: 'লগ আউট', profile: 'প্রোফাইল',
    setPhoto: 'প্রোফাইল ছবি সেট করুন', language: 'ভাষা', more: 'আরও', features: 'সুবিধা', addBhajan: 'ভজন যোগ করুন', back: 'ফিরে',
    shareCommunity: 'আপনার প্রিয় ভজন কমিউনিটির সাথে শেয়ার করুন', god: 'ঈশ্বর',
    lyrics: 'গান', details: 'বিস্তারিত', selectGodForBhajan: 'ভজনের জন্য ঈশ্বর নির্বাচন করুন',
    addAnotherGod: 'আরও একটি ঈশ্বর যোগ করুন', addDeityHint: 'তালিকায় না থাকলে যোগ করুন',
    changeGod: 'ঈশ্বর পরিবর্তন করুন', bhajansCount: 'ভজন',
    recent: 'সাম্প্রতিক', meditation: 'ধ্যান', community: 'সম্প্রদায়', temple: 'মন্দির', kirtanAi: 'কীর্তন AI',
    notifications: 'বিজ্ঞপ্তি', switchToDarkMode: 'ডার্ক মোড চালু করুন', switchToLightMode: 'লাইট মোড চালু করুন',
    pricing: 'মূল্য', about: 'আমাদের সম্পর্কে',
  },
  ta: {
    home: 'முகப்பு', browse: 'ஆராய்வு', trending: 'டிரெண்டிங்', search: 'தேடல்',
    upload: 'பதிவேற்று', login: 'உள்நுழை', logout: 'வெளியேறு', profile: 'சுயவிவரம்',
    setPhoto: 'சுயவிவரப் புகைப்படம் அமை', language: 'மொழி', more: 'மேலும்', features: 'வசதிகள்', addBhajan: 'பஜன் சேர்க்கவும்', back: 'பின்',
    shareCommunity: 'உங்கள் விருப்ப பஜன்களை சமூகத்துடன் பகிரவும்', god: 'கடவுள்',
    lyrics: 'வரிகள்', details: 'விவரங்கள்', selectGodForBhajan: 'பஜனுக்கு கடவுளை தேர்வு செய்யவும்',
    addAnotherGod: 'மற்றொரு கடவுளை சேர்', addDeityHint: 'பட்டியலில் இல்லையெனில் புதிதாக சேர்க்கவும்',
    changeGod: 'கடவுளை மாற்று', bhajansCount: 'பஜன்கள்',
    recent: 'சமீபத்திய', meditation: 'தியானம்', community: 'சமூகம்', temple: 'கோவில்', kirtanAi: 'கீர்த்தன் AI',
    notifications: 'அறிவிப்புகள்', switchToDarkMode: 'டார்க் மோடு மாற்று', switchToLightMode: 'லைட் மோடு மாற்று',
    pricing: 'விலை', about: 'எங்களை பற்றி',
  },
};

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem('app_language') as SupportedLanguage | null;
    return stored || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('lang-hi', language === 'hi');
    // Safety net: clear any stuck body scroll/pointer locks left by modals
    // (e.g. native <select> inside Radix Sheet on mobile can leave body
    // with pointer-events:none / overflow:hidden, freezing the page).
    if (typeof document !== 'undefined') {
      const inlineOverflow = document.body.style.overflow;
      if (inlineOverflow === 'hidden') {
        document.body.style.overflow = '';
      }
      const inlinePointerEvents = document.body.style.pointerEvents;
      if (inlinePointerEvents === 'none') {
        document.body.style.pointerEvents = '';
      }
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey, fallback?: string) => {
        return translations[language][key] || translations.en[key] || fallback || key;
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
