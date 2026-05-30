import { buildPanchangForZone } from '../../src/lib/panchang/fetchZone';
import { ZONES } from '../../src/utils/panchangZone';

export const config = {
  maxDuration: 300,
};

/**
 * Vercel cron: warms live Panchang for all zones (CDN cache).
 * Static JSON is still updated daily via GitHub Actions.
 */
export default async function handler(request: Request): Promise<Response> {
  const auth = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const results: Array<{ zone: string; ok: boolean; date?: string; error?: string }> = [];

  for (const zone of ZONES) {
    try {
      const data = await buildPanchangForZone(zone);
      results.push({ zone: zone.name, ok: true, date: data.date });
    } catch (error) {
      results.push({
        zone: zone.name,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const okCount = results.filter((item) => item.ok).length;
  return new Response(
    JSON.stringify({
      ok: okCount === ZONES.length,
      zones: results,
      updated_at: new Date().toISOString(),
    }),
    {
      status: okCount > 0 ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
