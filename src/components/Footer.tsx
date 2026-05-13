import { useLanguage } from "@/hooks/useLanguage";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-10 mt-16">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-display text-xl font-bold text-gradient-saffron mb-2">
          {t('bhajansSandhya')}
        </p>
        <p className="hindi-text text-muted-foreground">
          {t('footerTagline')}
        </p>
      </div>
    </footer>
  );
}
