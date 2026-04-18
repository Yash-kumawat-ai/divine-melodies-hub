import { useLanguage } from "@/hooks/useLanguage";

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-10 mt-16">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-display text-xl font-bold text-gradient-saffron mb-2">
          {language === 'hi' ? 'भजन संग्रह' : 'Bhajan Sangrah'}
        </p>
        <p className="hindi-text text-muted-foreground">
          {language === 'hi' ? 'भजन संग्रह — आपका भक्ति संगीत का खजाना' : 'Bhajan Sangrah — your devotional music treasure'}
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          {language === 'hi' ? 'आपका भक्ति संगीत संग्रह' : 'Your devotional music collection'}
        </p>
      </div>
    </footer>
  );
}
