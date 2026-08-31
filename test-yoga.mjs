import {
  getPanchangam,
  Observer,
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

console.log("\n========== YOGA DIAGNOSTIC ==========\n");

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

  console.log("Yoga index:", p.yoga);
  console.log("Yoga name:", yogaNames[p.yoga]);

  console.log(
    "Yoga end:",
    p.yogaEndTime instanceof Date
      ? p.yogaEndTime.toISOString()
      : p.yogaEndTime
  );

  console.log("\nAll yoga periods:");

  console.log(
    JSON.stringify(
      p.yogas,
      (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      },
      2
    )
  );

  console.log("\n");
}