/**
 * Email notifications have been disabled.
 * All moderation notifications are now delivered in-app only (zero cost).
 * This edge function is kept as a placeholder and returns 200 with no-op.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      message: 'Email notifications disabled. All notifications are in-app only.',
      processed: 0,
      sent: 0,
      failed: 0,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  );
});
