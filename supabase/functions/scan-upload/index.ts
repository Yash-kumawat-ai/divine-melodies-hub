import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Only allow fetching from trusted CDN domains to prevent SSRF
const ALLOWED_DOMAINS = [
  'res.cloudinary.com',
  'i.ytimg.com',
  'img.youtube.com',
  'lh3.googleusercontent.com',
];

function isUrlAllowed(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') return false;
    return ALLOWED_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication check ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ clean: false, reason: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ clean: false, reason: 'Invalid or expired session' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { fileUrl } = await req.json();

    if (!fileUrl || typeof fileUrl !== 'string') {
      return new Response(JSON.stringify({ clean: false, reason: 'Missing file URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- SSRF Protection: Only allow trusted domains ---
    if (!isUrlAllowed(fileUrl)) {
      return new Response(JSON.stringify({ clean: false, reason: 'URL domain not allowed. Only trusted CDN domains are accepted.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const headResponse = await fetch(fileUrl, { method: 'HEAD' });
    if (!headResponse.ok) {
      throw new Error('Unable to inspect uploaded file');
    }

    const contentType = headResponse.headers.get('content-type') || '';
    const contentLength = Number(headResponse.headers.get('content-length') || 0);

    if (!ALLOWED_TYPES.includes(contentType)) {
      return new Response(JSON.stringify({ clean: false, reason: `Unsupported type: ${contentType}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (contentLength > MAX_BYTES) {
      return new Response(JSON.stringify({ clean: false, reason: 'File too large for safe processing' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Placeholder security gate: production should integrate external AV scanner before marking clean.
    return new Response(JSON.stringify({ clean: true, scan: 'basic-validation' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scan failed';
    return new Response(JSON.stringify({ clean: false, reason: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
