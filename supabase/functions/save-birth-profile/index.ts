import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

async function computeSha256(canonical: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured: missing Supabase environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate user session
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      date_of_birth,
      birth_time,
      birth_time_accuracy,
      gender,
      place_query,
      place_label,
      country_code = "IN",
      admin1,
      lat,
      lng,
      timezone_iana,
      utc_offset_at_birth,
      ayanamsa = "lahiri",
      force_reenqueue = false,
    } = body;

    // Strict Parameter Validations
    if (!date_of_birth || typeof date_of_birth !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth.trim())) {
      return new Response(JSON.stringify({ error: "Invalid date_of_birth: format must be YYYY-MM-DD" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!birth_time_accuracy || !["exact", "approximate", "unknown"].includes(birth_time_accuracy)) {
      return new Response(JSON.stringify({ error: "Invalid birth_time_accuracy: must be exact, approximate, or unknown" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accuracy = birth_time_accuracy as "exact" | "approximate" | "unknown";
    let cleanTime: string | null = null;

    if (accuracy !== "unknown") {
      if (typeof birth_time === "string" && birth_time.trim()) {
        let t = birth_time.trim();
        // Allow H:mm -> 0H:mm
        if (/^\d:[0-5]\d$/.test(t)) {
          t = `0${t}`;
        }
        // Allow HH:mm:ss -> HH:mm
        if (/^\d{2}:\d{2}:\d{2}$/.test(t)) {
          t = t.slice(0, 5);
        }
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) {
          return new Response(JSON.stringify({ error: `Invalid birth_time: '${birth_time}'. Expected HH:mm (24-hour)` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        cleanTime = t;
      } else {
        return new Response(JSON.stringify({ error: "birth_time is required when birth_time_accuracy is exact or approximate" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const cleanGender = (gender && ["male", "female", "other", "unspecified"].includes(gender)) ? gender : "unspecified";

    const cleanLat = Number(lat);
    const cleanLng = Number(lng);
    if (isNaN(cleanLat) || isNaN(cleanLng) || cleanLat < -90 || cleanLat > 90 || cleanLng < -180 || cleanLng > 180) {
      return new Response(JSON.stringify({ error: "Invalid geographical coordinates: lat [-90, 90], lng [-180, 180]" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanTimezone = typeof timezone_iana === "string" && timezone_iana.trim() ? timezone_iana.trim() : "Asia/Kolkata";
    const cleanOffset = typeof utc_offset_at_birth === "string" && utc_offset_at_birth.trim() ? utc_offset_at_birth.trim() : "+05:30";

    // Compute canonical fingerprint
    const canonicalString = [
      date_of_birth.trim(),
      cleanTime ? cleanTime : "unknown",
      cleanLat.toFixed(4),
      cleanLng.toFixed(4),
      cleanTimezone.toLowerCase(),
      ayanamsa.trim().toLowerCase(),
    ].join("|");

    const fingerprint = await computeSha256(canonicalString);

    // Determine calculation jobs based on accuracy
    // If unknown time: only all_planet_data (house and lagna dependent jobs are skipped!)
    const jobTypes = accuracy === "unknown"
      ? ["all_planet_data"]
      : ["all_planet_data", "all_house_rasi_signs", "dasa_at_range", "horoscope_predictions"];

    // Use Service Role client to invoke save_and_enqueue_birth_profile RPC (server determines job plan)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { error: rpcError } = await serviceClient.rpc("save_and_enqueue_birth_profile", {
      p_date_of_birth: date_of_birth,
      p_birth_time: cleanTime,
      p_birth_time_accuracy: accuracy,
      p_gender: cleanGender,
      p_place_query: place_query || place_label || "Jaipur, India",
      p_place_label: place_label || place_query || "Jaipur, India",
      p_country_code: country_code,
      p_admin1: admin1 || null,
      p_lat: cleanLat,
      p_lng: cleanLng,
      p_timezone_iana: cleanTimezone,
      p_utc_offset_at_birth: cleanOffset,
      p_input_fingerprint: fingerprint,
      p_user_id: user.id,
      p_force_reenqueue: Boolean(force_reenqueue),
    });

    if (rpcError) {
      console.error("RPC save_and_enqueue_birth_profile error:", rpcError);
      return new Response(JSON.stringify({ error: rpcError.message || "Failed to save birth profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workerKick = fetch(`${supabaseUrl}/functions/v1/process-astrology-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: "{}",
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("process-astrology-job kick failed:", res.status, text.slice(0, 300));
        }
      })
      .catch((kickErr) => {
        console.error("process-astrology-job kick error:", kickErr);
      });

    const runtime = (globalThis as { EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void } }).EdgeRuntime;
    if (runtime?.waitUntil) {
      runtime.waitUntil(workerKick);
    } else {
      await Promise.race([
        workerKick,
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        input_fingerprint: fingerprint,
        birth_time_accuracy: accuracy,
        job_types_enqueued: jobTypes,
        status: "pending",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("save-birth-profile fatal error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
