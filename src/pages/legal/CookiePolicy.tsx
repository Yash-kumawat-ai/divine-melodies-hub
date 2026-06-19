import { SEO } from '@/components/SEO';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background font-body">
      <SEO title="Cookie Policy" description="How Raghavam uses cookies and how to manage them." />
      <article className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 13, 2026</p>

          <section className="space-y-4 text-foreground/80 text-base leading-relaxed">
            <h2 className="font-display text-xl font-bold text-foreground mt-8">1. What Cookies We Use</h2>
            <p>Raghavam uses only essential cookies required for the platform to function. These are:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase Auth Token</strong> — Stored in localStorage. Keeps you logged in between sessions and refreshes your authentication securely.</li>
              <li><strong>Theme Preference</strong> — Stored in localStorage. Remembers your dark/light mode choice.</li>
              <li><strong>Language Preference</strong> — Stored in localStorage. Remembers your selected language.</li>
            </ul>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">2. No Third-Party Tracking</h2>
            <p>We do not use any third-party tracking cookies, advertising cookies, or analytics cookies that identify individual users. We do not use Google Analytics, Facebook Pixel, or any similar tracking service.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">3. How to Clear Cookies</h2>
            <p>Since we use localStorage rather than traditional cookies, you can clear your data by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Opening your browser's Developer Tools (F12)</li>
              <li>Going to Application → Local Storage</li>
              <li>Clearing the entries for our domain</li>
            </ul>
            <p>Alternatively, clearing your browser's cache and cookies will also remove this data. Note that clearing this data will log you out and reset your preferences.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">4. Contact</h2>
            <p>If you have questions about our cookie practices, contact us at <a href="mailto:support@raghavam.com" className="text-brand-saffron hover:underline">support@raghavam.com</a>.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
