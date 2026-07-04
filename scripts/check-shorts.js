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

async function check() {
  console.log("Checking shorts and channels...");
  try {
    const { data: channels, error: channelError } = await supabase.from('whitelisted_channels').select('*');
    if (channelError) {
      console.log(`❌ Table "whitelisted_channels" error:`, channelError.message);
    } else {
      console.log(`✅ Table "whitelisted_channels": ${channels.length} rows`);
      console.log(JSON.stringify(channels, null, 2));
    }

    const { data: shorts, error: shortsError } = await supabase.from('shorts').select('*');
    if (shortsError) {
      console.log(`❌ Table "shorts" error:`, shortsError.message);
    } else {
      console.log(`✅ Table "shorts": ${shorts.length} rows`);
      console.log(JSON.stringify(shorts.slice(0, 5), null, 2));
    }
  } catch (e) {
    console.log(`❌ Error:`, e.message);
  }
}

check();
