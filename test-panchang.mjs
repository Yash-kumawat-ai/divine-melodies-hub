import {
  getPanchangam,
  Observer,
  tithiNames,
  nakshatraNames,
  yogaNames,
} from "@ishubhamx/panchangam-js";

const observer = new Observer(
  26.9124,  // Jaipur latitude
  75.7873,  // Jaipur longitude
  431       // approximate elevation in meters
);

const panchang = getPanchangam(
  new Date(),
  observer,
  {
    timezoneOffset: 330,
  }
);

console.log("========== PANCHANG TEST ==========");
console.log("Tithi:", tithiNames[panchang.tithi]);
console.log("Nakshatra:", nakshatraNames[panchang.nakshatra]);
console.log("Yoga:", yogaNames[panchang.yoga]);
console.log("Karana:", panchang.karana);
console.log("Paksha:", panchang.paksha);
console.log("Masa:", panchang.masa?.name);
console.log("Ritu:", panchang.ritu);
console.log("Sunrise:", panchang.sunrise);
console.log("Sunset:", panchang.sunset);

console.log("Rahu Kalam:", panchang.rahuKalam);
console.log("Yamaganda:", panchang.yamaganda);
console.log("Gulika:", panchang.gulika);

console.log("===================================");
console.log("========== PANCHANG OBJECT ==========");
console.log(JSON.stringify(panchang, (key, value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}, 2));