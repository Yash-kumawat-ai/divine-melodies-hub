import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = process.env.VITE_PUBLIC_SITE_URL || 'https://raghavam.com';

const staticRoutes = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/live-aarti', changefreq: 'hourly', priority: '0.95' },
  { loc: '/all-bhajans', changefreq: 'daily', priority: '0.9' },
  { loc: '/aarti', changefreq: 'daily', priority: '0.9' },
  { loc: '/chalisa', changefreq: 'daily', priority: '0.9' },
  { loc: '/katha', changefreq: 'weekly', priority: '0.85' },
  { loc: '/stotra', changefreq: 'weekly', priority: '0.85' },
  { loc: '/ashtakam', changefreq: 'weekly', priority: '0.85' },
  { loc: '/kavach', changefreq: 'weekly', priority: '0.85' },
  { loc: '/doha', changefreq: 'weekly', priority: '0.8' },
  { loc: '/mantra', changefreq: 'weekly', priority: '0.85' },
  { loc: '/shloka', changefreq: 'weekly', priority: '0.8' },
  { loc: '/rachana', changefreq: 'weekly', priority: '0.8' },
  { loc: '/recent-bhajans', changefreq: 'daily', priority: '0.8' },
  { loc: '/meditation', changefreq: 'daily', priority: '0.85' },
  { loc: '/meditation/mantra-japa', changefreq: 'daily', priority: '0.85' },
  { loc: '/panchang', changefreq: 'daily', priority: '0.8' },
  { loc: '/kundli', changefreq: 'daily', priority: '0.85' },
  { loc: '/temple', changefreq: 'daily', priority: '0.8' },
  { loc: '/shorts', changefreq: 'daily', priority: '0.8' },
  { loc: '/wallpaper', changefreq: 'weekly', priority: '0.7' },
  { loc: '/community', changefreq: 'daily', priority: '0.7' },
  { loc: '/about', changefreq: 'monthly', priority: '0.6' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
];

const deitySlugs = [
  'krishna', 'shiva', 'hanuman', 'rama', 'durga', 'ganesh', 'sai-baba', 'lakshmi', 'khatu-shyam'
];

const canonicalMantraSlugs = [
  'om-chanting',
  'om-namah-shivaya',
  'maha-mrityunjaya-mantra',
  'hare-krishna-mahamantra',
  'radhe-radhe',
  'jai-shree-ram',
  'om-namo-narayanaya',
  'gayatri-mantra',
  'shri-ganesha-mantra',
];

// Content item classification for static catalogue
const subtypePrefixMap = {
  'om-jai-shiv-omkara': '/aarti',
  'jai-ambe-gauri': '/aarti',
  'ganesh-aarti': '/aarti',
  'sai-baba-aarti': '/aarti',
  'om-jai-lakshmi-mata': '/aarti',
  'hanuman-chalisa': '/chalisa',
  'bajrang-baan': '/chalisa',
  'shiv-tandav-stotram': '/stotra',
};

async function run() {
  console.log('Generating sitemap.xml for', BASE_URL);

  const bhajansFile = fs.readFileSync(path.join(rootDir, 'src/data/bhajans.ts'), 'utf-8');
  const slugRegex = /slug:\s*'([^']+)'/g;
  const staticSlugs = new Set();
  let match;
  while ((match = slugRegex.exec(bhajansFile)) !== null) {
    const s = match[1];
    if (!deitySlugs.includes(s)) {
      staticSlugs.add(s);
    }
  }

  const entries = [];

  // 1. Core Landing & Hub Pages
  for (const r of staticRoutes) {
    entries.push(`  <url><loc>${BASE_URL}${r.loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`);
  }

  // 2. Deity Pages
  for (const d of deitySlugs) {
    entries.push(`  <url><loc>${BASE_URL}/deity/${d}</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`);
  }

  // 3. Subtype Canonical Devotional Content Pages
  for (const slug of staticSlugs) {
    const prefix = subtypePrefixMap[slug] || '/bhajan';
    entries.push(`  <url><loc>${BASE_URL}${prefix}/${slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
  }

  // 4. Mantra Japa Canonical Pages
  for (const mSlug of canonicalMantraSlugs) {
    entries.push(`  <url><loc>${BASE_URL}/meditation/mantra-japa/${mSlug}</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const outputPath = path.join(rootDir, 'public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`Successfully generated sitemap with ${entries.length} URLs at ${outputPath}`);
}

run().catch((err) => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
