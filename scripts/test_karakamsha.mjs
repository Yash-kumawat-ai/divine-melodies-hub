import { Observer, getKundli } from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");
const observer = new Observer(26.9124, 75.7873, 431);

const rawKundli = getKundli(birthDate, observer, { houseSystem: "whole_sign" });

// 1. Classical Atmakaraka: 7 physical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
const PHYSICAL_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

const planetDegrees = PHYSICAL_PLANETS.map((pName) => {
  const pData = rawKundli.planets[pName];
  const degInSign = pData.longitude % 30;
  return {
    name: pName,
    degreeInSign: degInSign,
    d1Rashi: pData.rashi,
    d1RashiName: pData.rashiName,
  };
});

planetDegrees.sort((a, b) => b.degreeInSign - a.degreeInSign);

console.log("=== PLANET DEGREES IN SIGN (for Atmakaraka) ===");
for (const p of planetDegrees) {
  console.log(`${p.name.padEnd(8)}: ${p.degreeInSign.toFixed(4)}° in ${p.d1RashiName} (Rashi ${p.d1Rashi})`);
}

const atmakaraka = planetDegrees[0];
console.log("\nATMAKARAKA (AK):", atmakaraka.name, "with", atmakaraka.degreeInSign.toFixed(4), "degrees");

// 2. Karakamsha: Sign of Atmakaraka in D9 Navamsha
const d9Data = rawKundli.vargas.d9;
const akD9Planet = d9Data.planets[atmakaraka.name];
const karakamshaRashi = akD9Planet.rashi;
const karakamshaRashiName = akD9Planet.rashiName;

console.log("KARAKAMSHA (D9 sign of AK):", karakamshaRashiName, `(Rashi ${karakamshaRashi})`);

// 3. 12th house from Karakamsha in D9 (Jivanmuktamsha)
const twelfthHouseRashi = (karakamshaRashi + 11) % 12;
const RASHI_NAMES = [
  { index: 0, en: "Aries", hi: "मेष", lord: "Mars" },
  { index: 1, en: "Taurus", hi: "वृषभ", lord: "Venus" },
  { index: 2, en: "Gemini", hi: "मिथुन", lord: "Mercury" },
  { index: 3, en: "Cancer", hi: "कर्क", lord: "Moon" },
  { index: 4, en: "Leo", hi: "सिंह", lord: "Sun" },
  { index: 5, en: "Virgo", hi: "कन्या", lord: "Mercury" },
  { index: 6, en: "Libra", hi: "तुला", lord: "Venus" },
  { index: 7, en: "Scorpio", hi: "वृश्चिक", lord: "Mars" },
  { index: 8, en: "Sagittarius", hi: "धनु", lord: "Jupiter" },
  { index: 9, en: "Capricorn", hi: "मकर", lord: "Saturn" },
  { index: 10, en: "Aquarius", hi: "कुम्भ", lord: "Saturn" },
  { index: 11, en: "Pisces", hi: "मीन", lord: "Jupiter" },
];

const twelfthHouseMeta = RASHI_NAMES[twelfthHouseRashi];
console.log("12TH FROM KARAKAMSHA IN D9:", twelfthHouseMeta.en, `(Rashi ${twelfthHouseRashi}) | Lord: ${twelfthHouseMeta.lord}`);

// Check occupants in 12th from Karakamsha in D9
const occupantsIn12th = [];
for (const [pName, pD9] of Object.entries(d9Data.planets)) {
  if (pD9.rashi === twelfthHouseRashi) {
    occupantsIn12th.push(pName);
  }
}

console.log("OCCUPANTS IN 12TH FROM KARAKAMSHA IN D9:", occupantsIn12th);

