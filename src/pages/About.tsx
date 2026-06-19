import { motion } from 'framer-motion';
import { Heart, Shield, Users, HandHeart, Github, Twitter, Mail, Lightbulb, Rocket, Music, PartyPopper, MapPin, Linkedin, Instagram } from 'lucide-react';
import { SEO } from '@/components/SEO';
import founderPhoto from '@/assets/founder-yash.png';
import { useLanguage } from '@/hooks/useLanguage';

const milestones = [
  { icon: Lightbulb, titleEn: 'The Idea', titleHi: 'विचार', date: 'Dec 2025', descEn: 'A vision to create a unified platform for devotional music.', descHi: 'भक्ति संगीत के लिए एक एकीकृत मंच बनाने का विचार।' },
  { icon: Rocket, titleEn: 'Beta Launch', titleHi: 'बीटा लॉन्च', date: 'Feb 2026', descEn: 'First version live with search, bhajan, and upload features.', descHi: 'खोज, भजन और अपलोड सुविधाओं के साथ पहला संस्करण लाइव।' },
  { icon: Music, titleEn: 'First 100 Bhajans', titleHi: 'पहले 100 भजन', date: 'Mar 2026', descEn: 'Community-contributed bhajans reach the first milestone.', descHi: 'समुदाय द्वारा साझा किए गए भजन पहले माइलस्टोन तक पहुँचे।' },
  { icon: PartyPopper, titleEn: 'Public Launch', titleHi: 'सार्वजनिक लॉन्च', date: 'May 2026', descEn: 'Full production release with admin moderation and premium plans.', descHi: 'एडमिन मॉडरेशन और प्रीमियम योजनाओं के साथ पूर्ण उत्पादन रिलीज़।' },
];

export default function About() {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const values = [
    { icon: Heart, title: t('devotionValue'), desc: t('devotionValueDesc') },
    { icon: Shield, title: t('authenticityValue'), desc: t('authenticityValueDesc') },
    { icon: Users, title: t('communityValue'), desc: t('communityValueDesc') },
    { icon: HandHeart, title: t('sevaValue'), desc: t('sevaValueDesc') },
  ];

  const missionPara1 = isHi
    ? 'भारत की भक्ति संगीत परंपरा एक हजार वर्षों से अधिक पुरानी है — मीरा बाई और कबीर की भक्ति कविताओं से लेकर आज मंदिरों और घरों में गूँजने वाली मधुर धुनों तक। फिर भी इस विरासत का बड़ा हिस्सा बिखरी हुई रिकॉर्डिंग्स, पुरानी किताबों और बुजुर्ग भक्तों की स्मृतियों में ही सिमटा हुआ है।'
    : 'India\'s devotional music tradition spans over a thousand years — from the ecstatic poems of Meera Bai and Kabir to the melodic renditions that fill temples and homes today. Yet much of this heritage exists only in scattered recordings, faded books, and the memories of elderly devotees.';

  const missionPara2 = isHi
    ? 'राघवम् एक सरल विश्वास से जन्मा है: कि हर भजन इंटरनेट पर एक स्थायी घर का हकदार है, सटीक बोलों, उचित श्रेय और संगीत के माध्यम से परमात्मा की खोज करने वाले हर व्यक्ति के लिए आसान पहुँच के साथ। हम हिंदू भक्ति गीतों का सबसे बड़ा, सबसे सटीक और सबसे सुलभ संग्रह बना रहे हैं — एक ऐसे समुदाय द्वारा संचालित जो संरक्षण की गहरी भावना रखता है।'
    : 'Raghavam was born from a simple belief: that every bhajan deserves a permanent home on the internet, complete with accurate lyrics, proper attribution, and easy access for anyone who seeks the divine through music. We are building the largest, most accurate, and most accessible collection of Hindu devotional songs — powered by a community that cares deeply about preservation.';

  const founderStory = isHi
    ? 'मैं यश कुमावत हूँ, जयपुर, राजस्थान का एक डेवलपर, जिसे भक्ति संगीत और प्रौद्योगिकी दोनों से गहरा प्रेम है। मैंने राघवम् इसलिए बनाया क्योंकि मैं चाहता था कि भारत और दुनिया भर के हर भक्त के पास भजनों को खोजने, अपलोड करने और अनुभव करने के लिए एक साफ, व्यवस्थित जगह हो। जो एक व्यक्तिगत प्रोजेक्ट था वह एक मिशन बन गया — आधुनिक तकनीक का उपयोग करके भारत की भक्ति संगीत विरासत को संरक्षित करना। यहाँ कोड की हर पंक्ति भक्ति और इस संस्कृति के प्रेम से लिखी गई है।'
    : 'I\'m Yash Kumawat, a developer from Jaipur, Rajasthan with a deep passion for devotional music and technology. I built Raghavam because I wanted every devotee in India and around the world to have one clean, organized place to discover, upload, and experience bhajans. What started as a personal project became a mission — to preserve India\'s devotional music heritage using modern technology. Every line of code here is written with bhakti and love for this culture.';

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO
        title="About"
        description="Learn about Raghavam — our mission to preserve India's devotional music heritage, our team, and our journey."
      />

      {/* Mission */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t('ourMission')}
          </motion.h1>
          <motion.div
            className="text-lg text-muted-foreground leading-relaxed space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p>{missionPara1}</p>
            <p>{missionPara2}</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('ourValues')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-saffron/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-brand-saffron" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('meetTheFounder')}
          </h2>
          <motion.div
            className="rounded-2xl border border-orange-900/40 bg-[#1a1006] p-6 md:p-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-brand-saffron shadow-lg shadow-brand-saffron/20">
                  <img
                    src={founderPhoto}
                    alt="Yash Kumawat"
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-cream">Yash Kumawat</h3>
                <p className="text-xs text-brand-cream/50 mb-2">@yashkumawat1209</p>
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-saffron/15 text-brand-saffron text-xs font-semibold mb-5">
                  {t('founderAndDeveloper')}
                </span>

                <p className="text-sm md:text-base text-brand-cream/70 leading-relaxed mb-6">
                  {founderStory}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-saffron/10 border border-orange-900/30 text-sm text-brand-cream/80">
                    <Music className="w-4 h-4 text-brand-saffron" /> {isHi ? 'मंच पर भजन' : 'Bhajans on Platform'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-saffron/10 border border-orange-900/30 text-sm text-brand-cream/80">
                    <Users className="w-4 h-4 text-brand-saffron" /> {isHi ? 'भक्त जुड़े' : 'Devotees Joined'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-saffron/10 border border-orange-900/30 text-sm text-brand-cream/80">
                    <MapPin className="w-4 h-4 text-brand-saffron" /> {isHi ? 'जयपुर में बना' : 'Built in Jaipur'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <a href="https://github.com/Yash-kumawat-ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-orange-900/30 text-sm text-brand-cream/70 hover:text-brand-saffron hover:border-brand-saffron/40 transition-colors">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/yash-kumawat-908336330/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-orange-900/30 text-sm text-brand-cream/70 hover:text-brand-saffron hover:border-brand-saffron/40 transition-colors">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                  <a href="https://www.instagram.com/yashkumawat52" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-orange-900/30 text-sm text-brand-cream/70 hover:text-brand-saffron hover:border-brand-saffron/40 transition-colors">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-brand-cream/50">
                    <MapPin className="w-4 h-4" /> {isHi ? 'जयपुर, राजस्थान' : 'Jaipur, Rajasthan'}
                  </span>
                </div>

                <a href="mailto:yashkumawatai@gmail.com" className="inline-flex items-center gap-2 text-sm text-brand-saffron hover:underline">
                  <Mail className="w-4 h-4" /> yashkumawatai@gmail.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('ourStory')}
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-1/2" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.titleEn}
                className={`relative flex items-start gap-4 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:gap-8`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-brand-saffron/10 border-2 border-brand-saffron flex items-center justify-center shrink-0 z-10 md:mx-auto">
                  <m.icon className="w-5 h-5 text-brand-saffron" />
                </div>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <p className="text-xs text-brand-saffron font-medium">{m.date}</p>
                  <h3 className="font-display text-lg font-bold text-foreground">{isHi ? m.titleHi : m.titleEn}</h3>
                  <p className="text-sm text-muted-foreground">{isHi ? m.descHi : m.descEn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t('getInTouch')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('getInTouchSubtitle')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:support@raghavam.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-saffron text-white font-medium hover:bg-brand-saffron/90 transition-colors"
            >
              <Mail className="w-4 h-4" /> {t('emailUs')}
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border hover:border-brand-saffron/30 transition-colors">
              <Twitter className="w-5 h-5 text-muted-foreground" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border hover:border-brand-saffron/30 transition-colors">
              <Github className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
