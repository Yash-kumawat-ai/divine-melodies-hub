import {
  getPanchangam,
  Observer,
  tithiNames,
  nakshatraNames,
  yogaNames,
} from "@ishubhamx/panchangam-js";

const locations = [
  { name: "Jaipur", lat: 26.9124, lon: 75.7873, elevation: 431 },
  { name: "Delhi", lat: 28.6139, lon: 77.2090, elevation: 216 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, elevation: 14 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739, elevation: 80 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, elevation: 9 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, elevation: 920 },
];

const date = new Date("2026-08-30T12:00:00Z");

console.log("======================================");
console.log("DEEP LOCATION CONSISTENCY TEST");
console.log("Instant:", date.toISOString());
console.log("======================================\n");

for (const location of locations) {
  const observer = new Observer(
    location.lat,
    location.lon,
    location.elevation
  );

  const p = getPanchangam(date, observer, {
    timezoneOffset: 330,
  });

  console.log(`===== ${location.name} =====`);

  console.log("Tithi:", tithiNames[p.tithi]);
  console.log("Nakshatra:", nakshatraNames[p.nakshatra]);
  console.log("Nakshatra Pada:", p.nakshatraPada);
  console.log("Yoga:", yogaNames[p.yoga]);
  console.log("Karana:", p.karana);

  console.log("\nPlanetary positions:");

  if (p.planets) {
    console.log(JSON.stringify(p.planets, null, 2));
  } else {
    console.log("No p.planets field");
  }

  console.log("\nFull object keys:");
  console.log(Object.keys(p));

  console.log("\n======================================\n");
}