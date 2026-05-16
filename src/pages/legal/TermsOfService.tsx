import { SEO } from '@/components/SEO';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background font-body">
      <SEO title="Terms of Service" description="Terms and conditions for using the Hari Kirtan platform." />
      <article className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 13, 2026</p>

          <section className="space-y-4 text-foreground/80 text-base leading-relaxed">
            <h2 className="font-display text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>By accessing or using Hari Kirtan, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">2. User Conduct</h2>
            <p>You agree to use Hari Kirtan respectfully and lawfully. You must not upload content that is offensive, hateful, infringing, or unrelated to devotional music. Spam, harassment, and automated scraping are prohibited.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">3. Content Ownership</h2>
            <p>When you upload a bhajan, you retain ownership of your original content. By uploading, you grant Hari Kirtan a non-exclusive, worldwide license to display and distribute your content on the platform. You represent that you have the right to share the content you upload.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">4. Platform Moderation</h2>
            <p>All submissions go through a moderation review before being published. We reserve the right to reject, edit, or remove any content that violates these terms or our community guidelines. Moderation decisions are final.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">5. DMCA & Copyright</h2>
            <p>We respect intellectual property rights. If you believe content on our platform infringes your copyright, please contact us at support@harikirtan.com with details of the alleged infringement. We will investigate and take appropriate action, including removing infringing content.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">6. Account Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms, engage in abusive behavior, or use the platform in a way that harms the community. You may delete your account at any time by contacting us.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">7. Limitation of Liability</h2>
            <p>Hari Kirtan is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including loss of data or service interruptions.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">8. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:support@harikirtan.com" className="text-brand-saffron hover:underline">support@harikirtan.com</a>.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
