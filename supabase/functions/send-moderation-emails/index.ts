import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueuedNotification {
  id: number;
  user_id: string;
  bhajan_id: number;
  event_type: 'approved' | 'rejected' | 'changes_requested';
  subject: string;
  body: string;
  email_to: string | null;
  retry_count: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRole) {
      throw new Error('Missing Supabase service environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const senderEmail = Deno.env.get('MODERATION_FROM_EMAIL') || 'no-reply@bhajansandhya.com';

    const { data: queued, error: queuedError } = await supabase
      .from('moderation_notifications')
      .select('id,user_id,bhajan_id,event_type,subject,body,email_to,retry_count')
      .eq('delivery_status', 'queued')
      .order('created_at', { ascending: true })
      .limit(25);

    if (queuedError) throw queuedError;

    const notifications = (queued || []) as QueuedNotification[];
    let sent = 0;
    let failed = 0;

    for (const item of notifications) {
      try {
        let recipientEmail = item.email_to;

        if (!recipientEmail) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', item.user_id)
            .maybeSingle();
          recipientEmail = profile?.email || null;
        }

        if (!recipientEmail) {
          throw new Error('No recipient email found');
        }

        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY is not configured');
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [recipientEmail],
            subject: item.subject,
            html: `<p>${item.body}</p>`,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Resend request failed: ${errorText}`);
        }

        await supabase
          .from('moderation_notifications')
          .update({
            delivery_status: 'sent',
            sent_at: new Date().toISOString(),
            email_to: recipientEmail,
            last_error: null,
          })
          .eq('id', item.id);

        sent += 1;
      } catch (sendErr) {
        const message = sendErr instanceof Error ? sendErr.message : 'Unknown delivery error';
        await supabase
          .from('moderation_notifications')
          .update({
            delivery_status: item.retry_count >= 3 ? 'failed' : 'queued',
            retry_count: item.retry_count + 1,
            last_error: message,
          })
          .eq('id', item.id);
        failed += 1;
      }
    }

    return new Response(
      JSON.stringify({ processed: notifications.length, sent, failed }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
