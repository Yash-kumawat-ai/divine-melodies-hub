import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Calendar, Clock, User2, Share2, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import blogPosts from '@/data/blogPosts.json';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug]);
  const related = useMemo(
    () => (post ? blogPosts.filter((p) => p.category === post.category && p.id !== post.id).slice(0, 3) : []),
    [post],
  );

  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t('postNotFound')}</h1>
        <Button onClick={() => navigate('/blog')} variant="outline">{t('backToBlog')}</Button>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(t('linkCopied'));
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + shareUrl)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const paragraphs = post.content.split('\n\n');

  return (
    <div>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
      />

      <article className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <span className="text-xs font-medium text-brand-saffron">{post.category}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1"><User2 className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>

          <div className="prose prose-lg max-w-none">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-foreground/80 leading-relaxed mb-4 text-base">
                {p}
              </p>
            ))}
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> {t('shareArticle')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-1" /> {t('copyLink')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleWhatsApp} className="text-green-600 border-green-200 hover:bg-green-50">
                <MessageCircle className="w-4 h-4 mr-1" /> {t('whatsapp')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleTwitter} className="text-blue-500 border-blue-200 hover:bg-blue-50">
                Twitter
              </Button>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-8 p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-saffron/10 flex items-center justify-center font-bold text-brand-saffron">
                {post.author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.authorRole}</p>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">{t('relatedArticles')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/blog/${r.slug}`}
                    className="rounded-xl border border-border bg-card p-4 hover:border-brand-saffron/30 transition-colors group"
                  >
                    <span className="text-xs text-brand-saffron">{r.category}</span>
                    <h3 className="font-semibold text-foreground text-sm mt-1 group-hover:text-brand-saffron transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">{r.readTime}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
