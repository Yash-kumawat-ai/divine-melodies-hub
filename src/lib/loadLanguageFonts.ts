const SCRIPT_FONT_HREF: Record<string, string> = {
  gu: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap',
  bn: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap',
  ta: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap',
};

export function ensureLanguageFonts(lang: string) {
  if (typeof document === 'undefined') return;
  const href = SCRIPT_FONT_HREF[lang];
  if (!href) return;
  const id = `lang-font-${lang}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
