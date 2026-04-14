const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl } = await req.json();

    if (!fileUrl || typeof fileUrl !== 'string') {
      return new Response(JSON.stringify({ clean: false, reason: 'Missing file URL' }), {
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
