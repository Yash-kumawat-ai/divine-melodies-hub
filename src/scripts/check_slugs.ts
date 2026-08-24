import { generateBhajanSlug } from '../lib/slugUtils';

const supabaseUrl = 'https://khnqyhzlrxwmolyevaqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobnF5aHpscnh3bW9seWV2YXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzM5MjYsImV4cCI6MjA5MDg0OTkyNn0.86VEL7YBDpoiPXLXgxnVv73ia4JEUbbjUQdOxkzrkbI';

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/user_uploads?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const uploads = await res.json();
  console.log(`Found ${uploads.length} uploads.\n`);

  const mismatches: Array<{ id: string; title: string; currentSlug: string; canonicalSlug: string }> = [];

  uploads.forEach((u: any) => {
    const canonical = generateBhajanSlug(u.title, u.title_hindi);
    const dbSlug = u.slug;
    const matches = canonical === dbSlug;
    if (!matches) {
      mismatches.push({
        id: u.id,
        title: u.title,
        currentSlug: dbSlug,
        canonicalSlug: canonical
      });
      console.log(`[MISMATCH] ID: ${u.id}`);
      console.log(`  Title:          "${u.title}"`);
      console.log(`  Current DB Slug: "${dbSlug}"`);
      console.log(`  Canonical Slug:  "${canonical}"\n`);
    }
  });

  console.log(`Total Mismatches: ${mismatches.length} out of ${uploads.length}`);
}

main();
