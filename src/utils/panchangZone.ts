export const ZONES = [
  { name: 'north', city: 'Delhi', lat: 28.6139, lng: 77.209, label: 'North India' },
  { name: 'northwest', city: 'Jaipur', lat: 26.9124, lng: 75.7873, label: 'North-West India' },
  { name: 'west', city: 'Mumbai', lat: 19.076, lng: 72.8777, label: 'West India' },
  { name: 'central', city: 'Nagpur', lat: 21.1458, lng: 79.0882, label: 'Central India' },
  { name: 'northeast', city: 'Kolkata', lat: 22.5726, lng: 88.3639, label: 'North-East India' },
  { name: 'south', city: 'Bengaluru', lat: 12.9716, lng: 77.5946, label: 'South India' },
] as const;

export type PanchangZone = (typeof ZONES)[number];

const DEFAULT_ZONE_NAME = 'northwest';
const ZONE_OVERRIDE_KEY = 'panchang_zone_override';

function findZone(zoneName: string | null): PanchangZone | null {
  return ZONES.find((zone) => zone.name === zoneName) ?? null;
}

export function getNearestZone(userLat: number, userLng: number): PanchangZone {
  return ZONES.reduce((nearest, zone) => {
    const nearestDistance = (nearest.lat - userLat) ** 2 + (nearest.lng - userLng) ** 2;
    const zoneDistance = (zone.lat - userLat) ** 2 + (zone.lng - userLng) ** 2;
    return zoneDistance < nearestDistance ? zone : nearest;
  }, ZONES[0]);
}

export function getZoneOverride(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ZONE_OVERRIDE_KEY);
}

export function saveZoneOverride(zoneName: string): void {
  if (typeof window === 'undefined') return;
  if (findZone(zoneName)) {
    window.localStorage.setItem(ZONE_OVERRIDE_KEY, zoneName);
  }
}

export function clearZoneOverride(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ZONE_OVERRIDE_KEY);
}

export async function getZoneFromBrowser(): Promise<PanchangZone> {
  const override = findZone(getZoneOverride());
  if (override) return override;

  const defaultZone = findZone(DEFAULT_ZONE_NAME) ?? ZONES[0];

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return defaultZone;
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => resolve(defaultZone), 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timeout);
        resolve(getNearestZone(position.coords.latitude, position.coords.longitude));
      },
      () => {
        window.clearTimeout(timeout);
        resolve(defaultZone);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 24 * 60 * 60 * 1000,
        timeout: 5000,
      },
    );
  });
}
