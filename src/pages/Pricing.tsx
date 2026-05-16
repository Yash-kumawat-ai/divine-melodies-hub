import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

const faqsEn = [
  { q: 'How does billing work?', a: 'You can choose monthly or annual billing. Annual billing saves you 20%. Payments are processed securely through Razorpay.' },
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing period.' },
  { q: 'What happens to my uploads if I downgrade?', a: 'All your uploaded bhajans remain on the platform permanently. Downgrading only affects future upload limits and premium features.' },
  { q: 'Is the Free plan really free?', a: 'Absolutely. We believe devotion should never have a paywall. The Free plan gives you full access to browse and search bhajans, plus 3 uploads per month.' },
  { q: 'Do you offer refunds?', a: 'Yes, we offer a full refund within 7 days of purchase if you are not satisfied. Contact us at support@harikirtan.com.' },
  { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade at any time. When upgrading, you will be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle.' },
];

const faqsHi = [
  { q: 'बिलिंग कैसे काम करती है?', a: 'आप मासिक या वार्षिक बिलिंग चुन सकते हैं। वार्षिक बिलिंग से 20% की बचत होती है। भुगतान Razorpay के माध्यम से सुरक्षित रूप से किया जाता है।' },
  { q: 'क्या मैं कभी भी रद्द कर सकता हूँ?', a: 'हाँ, आप कभी भी अपनी सदस्यता रद्द कर सकते हैं। आपकी प्रीमियम सुविधाएं वर्तमान बिलिंग अवधि के अंत तक सक्रिय रहेंगी।' },
  { q: 'डाउनग्रेड करने पर मेरे अपलोड का क्या होगा?', a: 'आपके सभी अपलोड किए गए भजन हमेशा प्लेटफॉर्म पर रहेंगे। डाउनग्रेड केवल भविष्य की अपलोड सीमाओं और प्रीमियम सुविधाओं को प्रभावित करता है।' },
  { q: 'क्या मुफ्त योजना वाकई मुफ्त है?', a: 'बिल्कुल। हम मानते हैं कि भक्ति कभी भी पेवॉल के पीछे नहीं होनी चाहिए। मुफ्त योजना में भजन ब्राउज़ और खोज करने की पूरी पहुँच और 3 अपलोड/माह शामिल हैं।' },
  { q: 'क्या आप रिफंड देते हैं?', a: 'हाँ, यदि आप संतुष्ट नहीं हैं तो हम खरीद के 7 दिनों के भीतर पूरा रिफंड देते हैं। support@harikirtan.com पर संपर्क करें।' },
  { q: 'क्या मैं योजनाएं बदल सकता हूँ?', a: 'हाँ, आप कभी भी अपग्रेड या डाउनग्रेड कर सकते हैं। अपग्रेड करने पर आनुपातिक अंतर चार्ज किया जाएगा। डाउनग्रेड अगले बिलिंग चक्र में लागू होता है।' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: t('free'),
      monthlyPrice: 0,
      features: [
        { text: t('browseBhajansFeature'), included: true },
        { text: t('uploadLimit3'), included: true },
        { text: t('priorityReview'), included: false },
        { text: t('devoteeBadge'), included: false },
        { text: t('exclusiveBhajans'), included: false },
        { text: t('supportPlatform'), included: false },
        { text: t('earlyAccess'), included: false },
      ],
    },
    {
      id: 'devotee',
      name: t('devotee'),
      monthlyPrice: 99,
      popular: true,
      features: [
        { text: t('browseBhajansFeature'), included: true },
        { text: t('uploadUnlimited'), included: true },
        { text: t('priorityReview'), included: true },
        { text: t('devoteeBadge'), included: true },
        { text: t('exclusiveBhajans'), included: false },
        { text: t('supportPlatform'), included: false },
        { text: t('earlyAccess'), included: false },
      ],
    },
    {
      id: 'seva',
      name: t('seva'),
      monthlyPrice: 299,
      features: [
        { text: t('browseBhajansFeature'), included: true },
        { text: t('uploadUnlimited'), included: true },
        { text: t('priorityReview'), included: true },
        { text: t('devoteeBadge'), included: true },
        { text: t('exclusiveBhajans'), included: true },
        { text: t('supportPlatform'), included: true },
        { text: t('earlyAccess'), included: true },
      ],
    },
  ];

  const faqs = language === 'hi' ? faqsHi : faqsEn;

  const handleCheckout = (planId: string) => {
    if (!user) {
      navigate('/auth/login?redirect=/pricing');
      return;
    }
    if (planId === 'free') {
      toast.success(language === 'hi' ? 'आप मुफ्त योजना पर हैं!' : 'You are on the Free plan!');
      return;
    }
    toast.info('Payment integration coming soon! Your plan will be: ' + planId);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO
        title="Pricing"
        description="Choose the right plan for your devotional journey. Free, Devotee, or Seva — all plans include access to our bhajan collection."
      />

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('simpleHonestPricing')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              {t('choosePlan')}
            </p>

            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!annual ? 'bg-brand-saffron text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('monthly')}
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${annual ? 'bg-brand-saffron text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t('annual')} <span className="text-xs opacity-80">({t('save20')})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {plans.map((plan) => {
              const price = plan.monthlyPrice === 0
                ? 0
                : annual
                  ? Math.round(plan.monthlyPrice * 12 * 0.8)
                  : plan.monthlyPrice;

              return (
                <motion.div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 md:p-8 flex flex-col ${
                    plan.popular
                      ? 'border-2 border-brand-saffron bg-card shadow-lg shadow-brand-saffron/10'
                      : 'border-border bg-card'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: plans.indexOf(plan) * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-saffron text-white text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {t('mostPopular')}
                    </div>
                  )}
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    {price === 0 ? (
                      <p className="text-4xl font-bold text-foreground">{t('free')}</p>
                    ) : (
                      <>
                        <p className="text-4xl font-bold text-foreground">
                          ₹{price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {annual ? t('perYear') : t('perMonth')}
                        </p>
                        {annual && plan.monthlyPrice > 0 && (
                          <p className="text-xs text-brand-saffron mt-1">
                            ₹{Math.round((plan.monthlyPrice * 12 * 0.8) / 12)}{t('perMonth')} {t('billedAnnually')}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-sm">
                        {f.included ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={f.included ? 'text-foreground' : 'text-muted-foreground/60'}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.id)}
                    className={`w-full h-11 rounded-xl font-semibold ${
                      plan.popular
                        ? 'bg-brand-saffron hover:bg-brand-saffron/90 text-white'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.monthlyPrice === 0 ? t('getStarted') : t('subscribe')}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
              {t('faq')}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-foreground text-sm">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
