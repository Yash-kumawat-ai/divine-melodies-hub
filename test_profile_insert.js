import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLocalPath = './.env.local';
const content = fs.readFileSync(envLocalPath, 'utf-8');
const env = {};
content.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const k = trimmed.substring(0, idx).trim();
      const v = trimmed.substring(idx + 1).trim();
      env[k] = v;
    }
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('URL or Key is missing from .env.local!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  try {
    // 1. Try to fetch a user profile using a random UUID
    // This will tell us what columns exist in the table from the error metadata or results
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@user.local',
        name: 'Test Profile'
      })
      .select();

    console.log('Insert Result:', data);
    console.log('Insert Error:', error);
  } catch (err) {
    console.error('Runtime error:', err);
  }
}

run();
