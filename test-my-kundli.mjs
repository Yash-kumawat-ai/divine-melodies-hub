import {
  Observer,
  getKundli,
  getAyanamsa,
} from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");

const observer = new Observer(
  26.9124,
  75.7873,
  431
);

const kundli = getKundli(birthDate, observer, {
  houseSystem: "whole_sign",
});

console.log("======================================");
console.log("YASH KUMAWAT — KUNDLI TEST");
console.log("======================================");

console.log("\nBirth input:");
console.log("Date:", birthDate.toISOString());
console.log("Local: 5 February 2005, 3:00 PM");
console.log("Location: Jaipur, Rajasthan, India");
console.log("Timezone: Asia/Kolkata");
console.log("Coordinates: 26.9124, 75.7873");
console.log("Elevation:", 431, "m");

console.log("\nAyanamsa:");
console.log(getAyanamsa(birthDate));

console.log("\n======================================");
console.log("ASCENDANT / LAGNA");
console.log("======================================");

console.log(JSON.stringify(kundli.ascendant, null, 2));

console.log("\n======================================");
console.log("PLANETS");
console.log("======================================");

for (const [name, planet] of Object.entries(kundli.planets)) {
  console.log(`\n${name}`);
  console.log(JSON.stringify(planet, null, 2));
}

console.log("\n======================================");
console.log("HOUSES");
console.log("======================================");

console.log(JSON.stringify(kundli.houses, null, 2));

console.log("\n======================================");
console.log("VIMSHOTTARI DASHA");
console.log("======================================");

console.log(JSON.stringify(kundli.dasha, null, 2));

console.log("\n======================================");
console.log("VARGAS");
console.log("======================================");

console.log(JSON.stringify(kundli.vargas, null, 2));

console.log("\n======================================");
console.log("FULL KUNDLI KEYS");
console.log("======================================");

console.log(Object.keys(kundli));

console.log("\n======================================");
console.log("DONE");
console.log("======================================");