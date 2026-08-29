export type GeocodedPlace = {
  label: string;
  city: string;
  admin1?: string;
  country_code?: string;
  lat: number;
  lng: number;
  timezone_iana: string;
  utc_offset_at_birth: string;
};

const INDIA_BOX = { minLng: 68, minLat: 6, maxLng: 98, maxLat: 37 };

function indiaTimezone(): Pick<GeocodedPlace, "timezone_iana" | "utc_offset_at_birth"> {
  return { timezone_iana: "Asia/Kolkata", utc_offset_at_birth: "+05:30" };
}

function timezoneFor(lat: number, lng: number, country?: string): Pick<GeocodedPlace, "timezone_iana" | "utc_offset_at_birth"> {
  const inIndia =
    country === "India" ||
    country === "IN" ||
    (lng >= INDIA_BOX.minLng && lng <= INDIA_BOX.maxLng && lat >= INDIA_BOX.minLat && lat <= INDIA_BOX.maxLat);
  if (inIndia) return indiaTimezone();
  return indiaTimezone();
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
};

export async function searchBirthPlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");
  url.searchParams.set("bbox", `${INDIA_BOX.minLng},${INDIA_BOX.minLat},${INDIA_BOX.maxLng},${INDIA_BOX.maxLat}`);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error("Place search failed");
  const data = (await res.json()) as { features?: PhotonFeature[] };

  return (data.features ?? [])
    .map((f) => {
      const [lng, lat] = f.geometry?.coordinates ?? [];
      if (typeof lat !== "number" || typeof lng !== "number") return null;
      const city = f.properties?.name || f.properties?.city || q;
      const admin1 = f.properties?.state;
      const country = f.properties?.country;
      const parts = [city, admin1, country].filter(Boolean);
      const tz = timezoneFor(lat, lng, country);
      return {
        label: parts.join(", "),
        city,
        admin1,
        country_code: (f.properties?.countrycode || "IN").toUpperCase(),
        lat,
        lng,
        ...tz,
      } satisfies GeocodedPlace;
    })
    .filter((p): p is GeocodedPlace => p != null);
}

export const BIRTH_CITY_SEEDS: GeocodedPlace[] = [
  { label: "Jaipur, Rajasthan, India", city: "Jaipur", admin1: "Rajasthan", country_code: "IN", lat: 26.9124, lng: 75.7873, ...indiaTimezone() },
  { label: "Varanasi, Uttar Pradesh, India", city: "Varanasi", admin1: "Uttar Pradesh", country_code: "IN", lat: 25.3176, lng: 82.9739, ...indiaTimezone() },
  { label: "Ayodhya, Uttar Pradesh, India", city: "Ayodhya", admin1: "Uttar Pradesh", country_code: "IN", lat: 26.7922, lng: 82.1998, ...indiaTimezone() },
  { label: "Ujjain, Madhya Pradesh, India", city: "Ujjain", admin1: "Madhya Pradesh", country_code: "IN", lat: 23.1765, lng: 75.7885, ...indiaTimezone() },
  { label: "Delhi, India", city: "Delhi", admin1: "Delhi", country_code: "IN", lat: 28.6139, lng: 77.209, ...indiaTimezone() },
  { label: "Mumbai, Maharashtra, India", city: "Mumbai", admin1: "Maharashtra", country_code: "IN", lat: 19.076, lng: 72.8777, ...indiaTimezone() },
  { label: "Bengaluru, Karnataka, India", city: "Bengaluru", admin1: "Karnataka", country_code: "IN", lat: 12.9716, lng: 77.5946, ...indiaTimezone() },
  { label: "Kolkata, West Bengal, India", city: "Kolkata", admin1: "West Bengal", country_code: "IN", lat: 22.5726, lng: 88.3639, ...indiaTimezone() },
];
