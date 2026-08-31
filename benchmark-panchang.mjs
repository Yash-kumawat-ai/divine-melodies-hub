import fs from "node:fs";
import {
  getPanchangam,
  Observer,
  tithiNames,
  nakshatraNames,
  yogaNames,
} from "@ishubhamx/panchangam-js";

const TIMEZONE_OFFSET = 330; // India: UTC+5:30

const locations = [
  { name: "Jaipur", lat: 26.9124, lon: 75.7873, elevation: 431 },
  { name: "Delhi", lat: 28.6139, lon: 77.2090, elevation: 216 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, elevation: 14 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739, elevation: 80 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, elevation: 9 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, elevation: 920 },
];

// Carefully chosen dates:
// - ordinary days
// - Amavasya/Purnima periods
// - Ekadashi periods
// - Sankranti/festival periods
// - dates around lunar/calendar transitions
const dates = [
  "2026-01-01",
  "2026-01-03",
  "2026-01-18",
  "2026-01-19",
  "2026-01-29",

  "2026-02-01",
  "2026-02-15",
  "2026-02-17",
  "2026-02-28",

  "2026-03-03",
  "2026-03-15",
  "2026-03-19",
  "2026-03-20",

  "2026-04-02",
  "2026-04-14",
  "2026-04-30",

  "2026-05-01",
  "2026-05-15",
  "2026-05-31",

  "2026-06-15",
  "2026-06-29",

  "2026-07-02",
  "2026-07-14",
  "2026-07-29",

  "2026-08-15",
  "2026-08-30",

  "2026-09-01",
  "2026-10-20",
  "2026-11-08",
];

function iso(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

function getLocalTime(isoString) {
  if (!isoString) return null;

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}

function safeName(array, index) {
  return array?.[index] ?? index;
}

const results = [];
let caseNumber = 0;

console.log("\n==============================================");
console.log("   PANCHANGAM-JS 3.0.0 BENCHMARK");
console.log("==============================================\n");

console.log(`Locations : ${locations.length}`);
console.log(`Dates     : ${dates.length}`);
console.log(`Cases     : ${locations.length * dates.length}`);
console.log(`Timezone  : Asia/Kolkata (UTC+5:30)\n`);

for (const location of locations) {
  const observer = new Observer(
    location.lat,
    location.lon,
    location.elevation
  );

  for (const dateString of dates) {
    caseNumber++;

    // Noon UTC avoids accidental previous-day interpretation.
    const date = new Date(`${dateString}T12:00:00Z`);

    try {
      const p = getPanchangam(date, observer, {
        timezoneOffset: TIMEZONE_OFFSET,
      });

      const result = {
        case: caseNumber,
        date: dateString,
        location: location.name,
        latitude: location.lat,
        longitude: location.lon,

        // Core Panchanga
        tithi: safeName(tithiNames, p.tithi),
        nakshatra: safeName(nakshatraNames, p.nakshatra),
        nakshatraPada: p.nakshatraPada ?? null,
        yoga: safeName(yogaNames, p.yoga),
        karana: p.karana ?? null,
        paksha: p.paksha ?? null,

        // Calendar
        masa: p.masa?.name ?? p.masa ?? null,
        ritu: p.ritu ?? null,
        ayana: p.ayana ?? null,
        weekday: p.weekday ?? null,

        // Solar/lunar events
        sunrise: iso(p.sunrise),
        sunset: iso(p.sunset),
        sunriseIST: getLocalTime(iso(p.sunrise)),
        sunsetIST: getLocalTime(iso(p.sunset)),

        moonrise: iso(p.moonrise),
        moonset: iso(p.moonset),
        moonriseIST: getLocalTime(iso(p.moonrise)),
        moonsetIST: getLocalTime(iso(p.moonset)),

        // Rahu / Yama / Gulika
        rahuKalamStart: iso(p.rahuKalamStart),
        rahuKalamEnd: iso(p.rahuKalamEnd),
        yamagandaStart: iso(p.yamagandaKalam?.start),
        yamagandaEnd: iso(p.yamagandaKalam?.end),
        gulikaStart: iso(p.gulikaKalam?.start),
        gulikaEnd: iso(p.gulikaKalam?.end),

        // Muhurta
        abhijitStart: iso(p.abhijit?.start),
        abhijitEnd: iso(p.abhijit?.end),
        brahmaMuhurtaStart: iso(p.brahmaMuhurta?.start),
        brahmaMuhurtaEnd: iso(p.brahmaMuhurta?.end),

        // Raw object retained for later investigation
        raw: p,
      };

      results.push(result);

      console.log(
        `${String(caseNumber).padStart(3, "0")} | ` +
        `${location.name.padEnd(10)} | ` +
        `${dateString} | ` +
        `${String(result.tithi).padEnd(12)} | ` +
        `${String(result.nakshatra).padEnd(20)} | ` +
        `${String(result.yoga)}`
      );
    } catch (error) {
      console.error(
        `ERROR | ${location.name} | ${dateString}`,
        error
      );

      results.push({
        case: caseNumber,
        date: dateString,
        location: location.name,
        error: error?.message ?? String(error),
      });
    }
  }
}

// Save complete raw benchmark.
fs.writeFileSync(
  "panchang-benchmark-results.json",
  JSON.stringify(results, null, 2),
  "utf8"
);

// Create a compact CSV for easy analysis.
const csvFields = [
  "case",
  "date",
  "location",
  "latitude",
  "longitude",
  "tithi",
  "nakshatra",
  "nakshatraPada",
  "yoga",
  "karana",
  "paksha",
  "masa",
  "ritu",
  "ayana",
  "weekday",
  "sunriseIST",
  "sunsetIST",
  "moonriseIST",
  "moonsetIST",
  "rahuKalamStart",
  "rahuKalamEnd",
  "yamagandaStart",
  "yamagandaEnd",
  "gulikaStart",
  "gulikaEnd",
  "abhijitStart",
  "abhijitEnd",
  "brahmaMuhurtaStart",
  "brahmaMuhurtaEnd",
];

function csvEscape(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

const csv = [
  csvFields.join(","),
  ...results.map((row) =>
    csvFields.map((field) => csvEscape(row[field])).join(",")
  ),
].join("\n");

fs.writeFileSync(
  "panchang-benchmark-results.csv",
  csv,
  "utf8"
);

const errors = results.filter((r) => r.error);

console.log("\n==============================================");
console.log("BENCHMARK COMPLETE");
console.log("==============================================");
console.log(`Total cases : ${results.length}`);
console.log(`Errors      : ${errors.length}`);
console.log("");
console.log("Generated:");
console.log("  panchang-benchmark-results.json");
console.log("  panchang-benchmark-results.csv");
console.log("==============================================\n");