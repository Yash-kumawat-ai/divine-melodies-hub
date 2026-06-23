import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_UPLOAD_TYPES = new Set(['lyrics', 'avatar', 'deity']);

function resolveUploadFolder(uploadType: string, userId: string): string {
  if (uploadType === 'lyrics') return `bhajans/${userId}`;
  if (uploadType === 'avatar') return `avatars/${userId}`;
  return `deities/${userId}`;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha1Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-1', encoded);
  return toHex(digest);
}

function buildCloudinarySignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const base = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return sha1Hex(`${base}${apiSecret}`);
}

function sanitizeBaseFilename(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  return withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'upload';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const uploadTypeRaw = String(formData.get('uploadType') || 'lyrics').toLowerCase();

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'File is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_UPLOAD_TYPES.has(uploadTypeRaw)) {
      return new Response(JSON.stringify({ error: 'Invalid upload type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let fileType = (file.type || '').toLowerCase();
    if (fileType === 'image/jpg') fileType = 'image/jpeg';
    if (!ALLOWED_TYPES.includes(fileType)) {
      const ext = (file.name || '').split('.').pop()?.toLowerCase() ?? '';
      const byExt: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      };
      if (byExt[ext]) fileType = byExt[ext];
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return new Response(JSON.stringify({ error: `Unsupported file type: ${file.type || fileType || 'unknown'}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uploadFile =
      fileType !== file.type
        ? new File([await file.arrayBuffer()], file.name || 'upload.jpg', { type: fileType })
        : file;

    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'File exceeds 5MB limit' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: canUpload, error: rateError } = await userClient.rpc('check_upload_rate', {
      user_uuid: user.id,
      p_limit: 6,
    });

    if (rateError) {
      return new Response(JSON.stringify({ error: 'Rate limit check failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!canUpload) {
      return new Response(JSON.stringify({ error: 'Rate limited. Try again shortly.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
    const moderationProvider = Deno.env.get('CLOUDINARY_MODERATION') || 'aws_rek';

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary server credentials are missing');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const safeBase = sanitizeBaseFilename(uploadFile.name || 'upload');
    const publicId = `${Date.now()}_${safeBase}`;
    const folder = resolveUploadFolder(uploadTypeRaw, user.id);

    const signatureParams: Record<string, string> = {
      folder,
      public_id: publicId,
      timestamp,
    };

    if (moderationProvider.trim()) {
      signatureParams.moderation = moderationProvider.trim();
    }

    const signature = await buildCloudinarySignature(signatureParams, apiSecret);

    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', uploadFile);
    cloudinaryForm.append('api_key', apiKey);
    cloudinaryForm.append('timestamp', timestamp);
    cloudinaryForm.append('signature', signature);
    cloudinaryForm.append('folder', folder);
    cloudinaryForm.append('public_id', publicId);

    if (moderationProvider.trim()) {
      cloudinaryForm.append('moderation', moderationProvider.trim());
    }

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryForm,
    });

    const uploadJson = await uploadResponse.json();

    if (!uploadResponse.ok) {
      const errorMessage = uploadJson?.error?.message || 'Cloudinary upload failed';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        url: uploadJson.secure_url,
        publicId: uploadJson.public_id,
        bytes: uploadJson.bytes,
        format: uploadJson.format,
        uploadType: uploadTypeRaw,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
