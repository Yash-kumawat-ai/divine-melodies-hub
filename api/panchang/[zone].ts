import { buildPanchangForZone } from '../../src/lib/panchang/fetchZone';
import { ZONES } from '../../src/utils/panchangZone';

export const config = {
  maxDuration: 60,
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const url = new URL(request.url);
  const zoneName = url.pathname.split('/').filter(Boolean).pop() ?? '';
  const zone = ZONES.find((item) => item.name === zoneName);

  if (!zone) {
    return new Response(JSON.stringify({ error: `Unknown zone: ${zoneName}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await buildPanchangForZone(zone);
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    });

    if (request.method === 'HEAD') {
      return new Response(null, { status: 200, headers });
    }

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Panchang calculation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
