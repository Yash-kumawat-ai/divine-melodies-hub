import {
  getPanchangam,
  Observer,
  yogaNames,
} from "@ishubhamx/panchangam-js";

const kolkata = new Observer(
  22.5726,
  88.3639,
  9
);

const times = [
  "2026-08-29T18:00:00Z",
  "2026-08-29T20:00:00Z",
  "2026-08-29T22:00:00Z",
  "2026-08-29T23:00:00Z",
  "2026-08-30T00:00:00Z",
  "2026-08-30T02:00:00Z",
  "2026-08-30T06:00:00Z",
  "2026-08-30T12:00:00Z",
  "2026-08-30T18:00:00Z",
];

console.log("\n========== KOLKATA YOGA TIME TEST ==========\n");

for (const iso of times) {
  const date = new Date(iso);

  const p = getPanchangam(date, kolkata, {
    timezoneOffset: 330,
  });

  console.log(
    iso,
    "=>",
    yogaNames[p.yoga],
    "| index:",
    p.yoga,
    "| end:",
    p.yogaEndTime instanceof Date
      ? p.yogaEndTime.toISOString()
      : p.yogaEndTime
  );
}

console.log("\n=============================================\n");