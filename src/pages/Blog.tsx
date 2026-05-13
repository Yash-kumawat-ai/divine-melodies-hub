import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import LayoutFooter from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import blogPosts from '@/data/blogPosts.json';

export default function Blog() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { t } = useLanguage();

  const categories = [
    { key: 'All', label: t('all') },
    { key: 'Devotion', label: t('devotion') },
    { key: 'Culture', label: t('culture') },
    { key: 'App Updates', label: t('appUpdates') },
    { key: 'Stories', label: t('stories') },
  ];

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background font-body">
      <SEO
        title="Blog"
        description="Read about devotional music, bhajan history, platform updates, and stories from the Hari Kirtan community."
      />
      <Header />

      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('blogTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('blogSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchArticles')}
              className="max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-brand-saffron text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{t('noArticlesFound')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-brand-saffron/30 transition-colors"
                  >
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand-saffron/10 to-brand-gold/10 flex items-center justify-center">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-16 h-16 opacity-30"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium text-brand-saffron">{post.category}</span>
                      <h2 className="font-display text-lg font-bold text-foreground mt-1 mb-2 group-hover:text-brand-saffron transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-brand-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <LayoutFooter />
    </div>
  );
}
