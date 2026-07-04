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

async function run() {
  console.log("Triggering 'pull-shorts' edge function...");
  try {
    const { data, error } = await supabase.functions.invoke('pull-shorts', {
      body: { action: 'pull' }
    });

    if (error) {
      console.error("❌ Edge Function returned error:", error);
    } else {
      console.log("✅ Edge Function response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("❌ Network or unexpected error calling Edge Function:", err.message);
  }
}

run();
