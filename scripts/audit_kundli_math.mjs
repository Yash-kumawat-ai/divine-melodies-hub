import {
  Observer,
  getKundli,
  getAyanamsa,
  checkMangalDosha,
  getTithi,
  getNakshatra,
  getYoga,
  getKarana,
  getVara,
  getPaksha,
} from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");
const observer = new Observer(26.9124, 75.7873, 431);

const ay = getAyanamsa(birthDate);
const rawKundli = getKundli(birthDate, observer, { houseSystem: "whole_sign" });

console.log("=== EXACT ASTRONOMICAL AUDIT DATA ===");
console.log("Birth ISO UTC:", birthDate.toISOString());
console.log("Ayanamsa Value:", ay, `(${Math.floor(ay)}° ${Math.floor((ay % 1) * 60)}' ${(((ay % 1) * 60) % 1 * 60).toFixed(2)}")`);

console.log("\n--- ASCENDANT / LAGNA ---");
console.log(rawKundli.ascendant);

console.log("\n--- 9 NAVAGRAHAS + NODES ---");
for (const [name, p] of Object.entries(rawKundli.planets)) {
  const deg = p.longitude % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg % 1) * 60);
  const s = (((deg % 1) * 60) % 1 * 60).toFixed(1);
  console.log(`${name.padEnd(8)}: Long=${p.longitude.toFixed(5)}° | Sign=${p.rashi} (${p.rashiName}) | Deg=${d}° ${m}' ${s}" | Retro=${p.isRetrograde} | Speed=${p.speed?.toFixed(6)} | Nak=${p.nakshatra} Pada ${p.pada} (Lord: ${p.nakshatraLord})`);
}

console.log("\n--- HOUSES (Whole Sign) ---");
for (const h of rawKundli.houses) {
  console.log(`House ${h.number}: Rashi ${h.rashi} (${h.rashiName}) | Plan: [${(h.planets || []).join(", ")}]`);
}

console.log("\n--- VIMSHOTTARI DASHA ---");
console.log("Birth Nakshatra:", rawKundli.dasha?.birthNakshatra);
console.log("Pada:", rawKundli.dasha?.nakshatraPada);
console.log("Dasha Balance:", rawKundli.dasha?.dashaBalance);
console.log("Current MD (library):", rawKundli.dasha?.currentMahadasha);
console.log("Current AD (library):", rawKundli.dasha?.currentAntardasha);
console.log("Full Cycle count:", rawKundli.dasha?.fullCycle?.length);
if (rawKundli.dasha?.fullCycle) {
  console.log("All Mahadashas:");
  for (const c of rawKundli.dasha.fullCycle) {
    console.log(`  ${c.planet.padEnd(8)}: ${c.startTime} -> ${c.endTime}`);
  }
}

console.log("\n--- VARGAS AVAILABLE ---");
console.log("Vargas keys:", Object.keys(rawKundli.vargas || {}));

console.log("\n--- D9 NAVAMSHA ---");
console.log("D9 Ascendant:", rawKundli.vargas?.d9?.ascendant);
for (const [name, p] of Object.entries(rawKundli.vargas?.d9?.planets || {})) {
  console.log(`  D9 ${name.padEnd(8)}: Rashi ${p.rashi} (${p.rashiName}) | Long=${p.longitude?.toFixed(4)} | Nak=${p.nakshatra} p${p.pada}`);
}

console.log("\n--- D10 DASAMSA ---");
console.log("D10 Ascendant:", rawKundli.vargas?.d10?.ascendant);
for (const [name, p] of Object.entries(rawKundli.vargas?.d10?.planets || {})) {
  console.log(`  D10 ${name.padEnd(8)}: Rashi ${p.rashi} (${p.rashiName}) | Long=${p.longitude?.toFixed(4)} | Nak=${p.nakshatra} p${p.pada}`);
}

console.log("\n--- MANGAL DOSHA CHECK ---");
const md = checkMangalDosha(rawKundli);
console.log(md);

console.log("\n--- JANMA PANCHANGA ---");
console.log("Tithi:", getTithi(birthDate));
console.log("Nakshatra:", getNakshatra(birthDate));
console.log("Yoga:", getYoga(birthDate));
console.log("Karana:", getKarana(birthDate));
console.log("Vara:", getVara(birthDate));
console.log("Paksha:", getPaksha(birthDate));
