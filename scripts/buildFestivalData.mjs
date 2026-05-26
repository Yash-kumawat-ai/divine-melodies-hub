import fs from 'node:fs';
import path from 'node:path';

const SOURCE_PATH = path.resolve('festivaldata.txt');
const OUTPUT_ROOT = path.resolve('public/data/festivals');

const COLOR_MAP = {
  saffron: '#f59e0b',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#dc2626',
  white: '#f8fafc',
  green: '#16a34a',
  gold: '#d97706',
  blue: '#2563eb',
  multicolor: '#ec4899',
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00+05:30`));
}

function normalizeColor(value) {
  if (typeof value !== 'string' || !value.trim()) return '#f59e0b';
  if (value.startsWith('#')) return value;
  return COLOR_MAP[value.trim().toLowerCase()] || '#f59e0b';
}

function normalizeFestival(festival) {
  assert(festival && typeof festival === 'object', 'Festival record must be an object');
  assert(typeof festival.id === 'string' && festival.id.trim(), 'Festival is missing id');
  assert(isDate(festival.date), `${festival.id} has invalid date`);
  assert(typeof festival.name_en === 'string' && festival.name_en.trim(), `${festival.id} is missing name_en`);
  assert(typeof festival.name_hi === 'string' && festival.name_hi.trim(), `${festival.id} is missing name_hi`);
  assert(typeof festival.description_en === 'string' && festival.description_en.trim(), `${festival.id} is missing description_en`);
  assert(typeof festival.description_hi === 'string' && festival.description_hi.trim(), `${festival.id} is missing description_hi`);
  assert(Array.isArray(festival.regions), `${festival.id} regions must be an array`);
  assert(Array.isArray(festival.rituals), `${festival.id} rituals must be an array`);
  assert(Array.isArray(festival.tags), `${festival.id} tags must be an array`);

  const fasting = festival.fasting && typeof festival.fasting === 'object' ? festival.fasting : {};
  assert(typeof fasting.observed === 'boolean', `${festival.id} fasting.observed must be boolean`);

  return {
    id: festival.id,
    date: festival.date,
    name_en: festival.name_en,
    name_hi: festival.name_hi,
    name_sa: typeof festival.name_sa === 'string' ? festival.name_sa : '',
    type: festival.type || 'lunar',
    importance: festival.importance || 'medium',
    regions: festival.regions,
    regional_names: festival.regional_names && typeof festival.regional_names === 'object' ? festival.regional_names : {},
    deity: typeof festival.deity === 'string' ? festival.deity : '',
    description_en: festival.description_en,
    description_hi: festival.description_hi,
    fasting: {
      observed: fasting.observed,
      type: fasting.type ?? null,
      rules_en: fasting.rules ?? fasting.rules_en ?? '',
      rules_hi: fasting.rules_hi ?? '',
    },
    rituals: festival.rituals,
    color: normalizeColor(festival.color),
    tags: festival.tags,
  };
}

function summaryFor(festival) {
  return {
    id: festival.id,
    date: festival.date,
    name_en: festival.name_en,
    name_hi: festival.name_hi,
    importance: festival.importance,
    deity: festival.deity,
    color: festival.color,
    fasting_observed: festival.fasting.observed,
    tags: festival.tags,
  };
}

function main() {
  assert(fs.existsSync(SOURCE_PATH), `Missing source file: ${SOURCE_PATH}`);

  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  assert(Number.isInteger(source.year), 'Source year must be a number');
  assert(Array.isArray(source.festivals), 'Source festivals must be an array');

  const seen = new Set();
  const festivals = source.festivals.map(normalizeFestival).sort((a, b) => a.date.localeCompare(b.date));
  for (const festival of festivals) {
    assert(!seen.has(festival.id), `Duplicate festival id: ${festival.id}`);
    seen.add(festival.id);
  }

  const yearDir = path.join(OUTPUT_ROOT, String(source.year));
  fs.mkdirSync(yearDir, { recursive: true });

  const byMonth = new Map();
  for (const festival of festivals) {
    const month = festival.date.slice(0, 7);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(festival);
  }

  for (let monthNumber = 1; monthNumber <= 12; monthNumber += 1) {
    const month = `${source.year}-${String(monthNumber).padStart(2, '0')}`;
    const monthFestivals = byMonth.get(month) || [];
    const payload = {
      year: source.year,
      month,
      source: source.source || 'festivaldata.txt',
      updated: source.updated || new Date().toISOString().slice(0, 10),
      festivals: monthFestivals,
    };
    fs.writeFileSync(path.join(yearDir, `${month}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }

  const index = {
    version: source.version || '1.0',
    year: source.year,
    source: source.source || 'festivaldata.txt',
    updated: source.updated || new Date().toISOString().slice(0, 10),
    total_festivals: festivals.length,
    months: Array.from({ length: 12 }, (_, index) => {
      const month = `${source.year}-${String(index + 1).padStart(2, '0')}`;
      const monthFestivals = byMonth.get(month) || [];
      return {
        month,
        count: monthFestivals.length,
        major_count: monthFestivals.filter((festival) => festival.importance === 'major').length,
      };
    }),
    festivals: festivals.map(summaryFor),
  };

  fs.writeFileSync(path.join(yearDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Festival data built: ${festivals.length} festivals for ${source.year}`);
}

main();
