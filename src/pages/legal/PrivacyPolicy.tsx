import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import LayoutFooter from '@/components/layout/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background font-body">
      <SEO title="Privacy Policy" description="How Hari Kirtan collects, uses, and protects your personal information." />
      <Header />
      <article className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 13, 2026</p>

          <section className="space-y-4 text-foreground/80 text-base leading-relaxed">
            <h2 className="font-display text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
            <p>When you create an account, we collect your name, email address, and optionally your phone number. When you upload bhajans, we store the content you submit including titles, lyrics, and linked YouTube URLs.</p>
            <p>We use Supabase for authentication and data storage. Your password is hashed and never stored in plain text. We do not collect payment information directly — all payments are processed through Razorpay's secure infrastructure.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">2. How We Use Your Data</h2>
            <p>Your data is used to provide and improve the Hari Kirtan platform. This includes displaying your uploaded bhajans to other users, sending in-app notifications about moderation decisions, and personalizing your experience.</p>
            <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">3. Data Storage</h2>
            <p>All user data is stored securely on Supabase's infrastructure with Row Level Security (RLS) policies ensuring users can only access their own data. Avatar images are stored via Cloudinary.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">4. Cookies</h2>
            <p>We use only essential cookies required for authentication (Supabase session tokens). We do not use any third-party tracking or advertising cookies. See our Cookie Policy for details.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">5. Your Rights</h2>
            <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us at support@harikirtan.com. You may also delete your account through the platform settings.</p>

            <h2 className="font-display text-xl font-bold text-foreground mt-8">6. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:support@harikirtan.com" className="text-brand-saffron hover:underline">support@harikirtan.com</a>.</p>
          </section>
        </div>
      </article>
      <LayoutFooter />
    </div>
  );
}
