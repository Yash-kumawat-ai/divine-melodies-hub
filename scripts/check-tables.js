import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env variables manually
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'naam_sangh_groups',
  'naam_sangh_members',
  'naam_sangh_member_stats',
  'naam_sangh_progress',
  'groups',
  'group_members',
  'community_posts',
  'post_reactions',
  'post_comments',
  'event_rsvps',
  'question_option_votes'
];

async function check() {
  console.log("Checking tables against:", supabaseUrl);
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table "${table}":`, error.message);
      } else {
        console.log(`✅ Table "${table}": Exists!`);
      }
    } catch (e) {
      console.log(`❌ Table "${table}":`, e.message);
    }
  }
}

check();
