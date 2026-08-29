import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const VEDASTRO_BASE = "https://api.vedastro.org/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface NormalizedPlanet {
  sign: string;
  degree: number;
  isRetrograde: boolean;
  house?: number | null;
  aspects?: string[];
  nakshatra?: string;
  nakshatraPada?: number;
}

function normalizePlanetData(
  rawPlanets: Record<string, any>,
  birthTimeAccuracy: "exact" | "approximate" | "unknown"
): Record<string, NormalizedPlanet> {
  const isUnknown = birthTimeAccuracy === "unknown";
  const normalized: Record<string, NormalizedPlanet> = {};

  for (const [planetName, data] of Object.entries(rawPlanets)) {
    if (!data || typeof data !== "object") continue;
    normalized[planetName] = {
      sign: data.Sign ?? data.RasiSign ?? "",
      degree: Number(data.Degree ?? data.Longitude ?? 0),
      isRetrograde: Boolean(data.IsRetrograde ?? data.Motion === "Retrograde"),
      // STRICT FILTER: House placements cannot be trusted without birth time
      house: isUnknown ? null : (data.HouseNumber ?? data.House ?? null),
      aspects: isUnknown ? undefined : data.AllPlanetsInAspect,
    };
  }

  return normalized;
}

function filterPredictions(rawPredictionList: any[]): Record<string, string[]> {
  const categorized: Record<string, string[]> = {
    career: [],
    marriage: [],
    finance: [],
    family: [],
    spirituality: [],
    general: [],
  };

  if (!Array.isArray(rawPredictionList)) {
    return categorized;
  }

  for (const item of rawPredictionList) {
    const text = typeof item === "string" ? item : item.Description || item.Name || item.Text || "";
    const tags = Array.isArray(item.Tags) ? item.Tags.map((t: string) => t.toLowerCase()) : [];
    const lower = text.toLowerCase();

    if (tags.includes("career") || lower.includes("career") || lower.includes("job") || lower.includes("profession")) {
      if (categorized.career.length < 5) categorized.career.push(text);
    } else if (tags.includes("marriage") || lower.includes("marriage") || lower.includes("spouse") || lower.includes("relationship")) {
      if (categorized.marriage.length < 5) categorized.marriage.push(text);
    } else if (tags.includes("finance") || lower.includes("wealth") || lower.includes("money") || lower.includes("financial")) {
      if (categorized.finance.length < 5) categorized.finance.push(text);
    } else if (tags.includes("family") || lower.includes("family") || lower.includes("parents") || lower.includes("home")) {
      if (categorized.family.length < 5) categorized.family.push(text);
    } else if (tags.includes("spirituality") || lower.includes("spiritual") || lower.includes("devotion") || lower.includes("mind")) {
      if (categorized.spirituality.length < 5) categorized.spirituality.push(text);
    } else {
      if (categorized.general.length < 5) categorized.general.push(text);
    }
  }

  return categorized;
}

async function processSingleJob(supabase: any, job: any): Promise<any> {
  const { job_id, user_id, job_type, input_fingerprint, attempts } = job;

  // 1. Fetch User Birth Profile
  const { data: birthProfile, error: profileError } = await supabase
    .from("astrology_birth_profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (profileError || !birthProfile) {
    throw new Error(`Birth profile not found for user ${user_id}`);
  }

  // Prepare time string (Format: HH:mm DD/MM/YYYY +ZZ:ZZ)
  const [year, month, day] = birthProfile.date_of_birth.split("-");
  const ddmmyyyy = `${day}/${month}/${year}`;
  const timeStr = birthProfile.birth_time || "12:00";
  const stdTime = `${timeStr} ${ddmmyyyy} ${birthProfile.utc_offset_at_birth || "+05:30"}`;

  const locationObj = {
    Latitude: birthProfile.lat,
    Longitude: birthProfile.lng,
    Name: birthProfile.place_label || birthProfile.place_query,
  };

  const timeObj = {
    StdTime: stdTime,
    Location: locationObj,
  };

  // 2. Map generic calculation job type to calculation execution
  let endpoint = "";
  let requestBody: any = {};

  if (job_type === "planet_positions" || job_type === "all_planet_data" || job_type === "core") {
    endpoint = "AllPlanetData";
    requestBody = {
      PlanetName: "All",
      time: timeObj,
      Location: locationObj,
      Ayanamsa: "Lahiri",
    };
  } else if (job_type === "house_cusps" || job_type === "all_house_rasi_signs") {
    endpoint = "AllHouseRasiSigns";
    requestBody = {
      time: timeObj,
      Location: locationObj,
      Ayanamsa: "Lahiri",
    };
  } else if (job_type === "dasha_timeline" || job_type === "dasa_at_range" || job_type === "dasha") {
    endpoint = "DasaAtRange";
    requestBody = {
      birthTime: timeObj,
      startTime: timeObj,
      endTime: {
        StdTime: `12:00 01/01/2040 ${birthProfile.utc_offset_at_birth || "+05:30"}`,
        Location: locationObj,
      },
    };
  } else if (job_type === "astrological_insights" || job_type === "horoscope_predictions" || job_type === "predictions") {
    endpoint = "HoroscopePredictions";
    requestBody = {
      birthTime: timeObj,
    };
  } else {
    endpoint = "AllPlanetData";
    requestBody = { PlanetName: "All", time: timeObj, Location: locationObj };
  }

  const vedastroApiKey = Deno.env.get("VEDASTRO_API_KEY") || "FreeAPIUser";
  const response = await fetch(`${VEDASTRO_BASE}/Calculate/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": vedastroApiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const rawText = await response.text();
  let json: any = null;
  try { json = JSON.parse(rawText); } catch {}

  const isRateLimited = response.status === 429 || (
    json && json.Status === "Fail" && typeof json.Payload === "string" && json.Payload.toLowerCase().includes("rate limit exceeded")
  );

  if (isRateLimited) {
    console.warn("Astrology calculation rate limit exceeded for job:", job_id, "attempt:", attempts);
    const backoffMinutes = Math.pow(2, attempts);
    const runAfter = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();

    await supabase
      .from("astrology_calculation_jobs")
      .update({
        status: "queued",
        lease_until: null,
        run_after: runAfter,
        last_error: "Rate limit exceeded upstream (backoff scheduled)",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job_id);

    return { status: "rate_limited", job_id, backoffMinutes };
  }

  if (!response.ok || json?.Status === "Fail") {
    const detail = typeof json?.Payload === "string" ? json.Payload : rawText.slice(0, 400);
    throw new Error(`Astrology Calculation ${endpoint} failed (${response.status}): ${detail || "empty response"}`);
  }

  // 3. Normalize Payload
  let normalizedPayload: any = {};

  if (job_type === "planet_positions" || job_type === "all_planet_data" || job_type === "core") {
    const rawPlanets = json?.Payload?.AllPlanetData || json?.Payload || {};
    const planetMap: Record<string, any> = {};
    if (Array.isArray(rawPlanets)) {
      for (const item of rawPlanets) {
        if (item && typeof item === "object") {
          const key = Object.keys(item)[0];
          if (key) planetMap[key] = item[key];
        }
      }
    } else if (typeof rawPlanets === "object") {
      Object.assign(planetMap, rawPlanets);
    }
    normalizedPayload = {
      planets: normalizePlanetData(planetMap, birthProfile.birth_time_accuracy),
    };
  } else if (job_type === "house_cusps" || job_type === "all_house_rasi_signs") {
    const rawHouses = json?.Payload?.AllHouseRasiSigns || json?.Payload || [];
    const houses: Record<string, any> = {};
    if (Array.isArray(rawHouses)) {
      for (const h of rawHouses) {
        if (h.House) houses[h.House] = h.AllHouseRasiSigns;
      }
    }
    normalizedPayload = {
      houses,
      lagna: houses["House1"] || null,
    };
  } else if (job_type === "dasha_timeline" || job_type === "dasa_at_range" || job_type === "dasha") {
    normalizedPayload = {
      raw_dasha: json?.Payload || {},
    };
  } else if (job_type === "astrological_insights" || job_type === "horoscope_predictions" || job_type === "predictions") {
    const list = Array.isArray(json?.Payload) ? json.Payload : [];
    normalizedPayload = filterPredictions(list);
  }

  // 4. Persist Result atomically
  const { data: persistRes, error: persistErr } = await supabase.rpc("persist_astrology_job_result", {
    p_job_id: job_id,
    p_user_id: user_id,
    p_input_fingerprint: input_fingerprint,
    p_job_type: job_type,
    p_result_payload: normalizedPayload,
  });

  if (persistErr) {
    throw new Error(`persist_astrology_job_result RPC error: ${persistErr.message}`);
  }

  return { success: true, job_id, job_type, persist_result: persistRes };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate cron / service role
    const authHeader = req.headers.get("Authorization");
    const isServiceRole = authHeader === `Bearer ${supabaseServiceKey}`;
    const isCronSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isServiceRole && !isCronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized worker invocation" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const processedJobs: any[] = [];
    const startTime = Date.now();
    const MAX_EXECUTION_MS = 45000;

    while (Date.now() - startTime < MAX_EXECUTION_MS && processedJobs.length < 5) {
      const { data: leasedJobs, error: leaseError } = await supabase.rpc("lease_next_astrology_job", {
        p_lease_duration_seconds: 120,
      });

      if (leaseError) {
        console.error("lease_next_astrology_job RPC error:", leaseError);
        break;
      }

      if (!leasedJobs || leasedJobs.length === 0) {
        break;
      }

      const leased = leasedJobs[0];
      let jobResult: any;
      try {
        jobResult = await processSingleJob(supabase, leased);
      } catch (jobErr) {
        const message = jobErr instanceof Error ? jobErr.message : String(jobErr);
        console.error("process-astrology-job item failed:", leased.job_id, message);
        const maxed = Number(leased.attempts) >= 4;
        await supabase
          .from("astrology_calculation_jobs")
          .update({
            status: maxed ? "failed" : "queued",
            lease_until: null,
            last_error: message.slice(0, 500),
            run_after: new Date(Date.now() + 15000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", leased.job_id);
        await supabase.rpc("reconcile_astrology_profile_from_jobs", { p_user_id: leased.user_id });
        jobResult = { status: maxed ? "failed" : "retry", job_id: leased.job_id, error: message };
      }
      processedJobs.push(jobResult);

      if (jobResult.status === "rate_limited") {
        break;
      }

      // Small pacing buffer between jobs
      if (Date.now() - startTime < MAX_EXECUTION_MS - 2000 && processedJobs.length < 5) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        break;
      }
    }

    return new Response(
      JSON.stringify({
        status: processedJobs.length > 0 ? "completed" : "idle",
        jobs_processed_count: processedJobs.length,
        results: processedJobs,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("process-astrology-job fatal error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
