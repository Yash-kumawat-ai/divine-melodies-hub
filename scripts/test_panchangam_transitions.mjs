import { Observer, getPanchangam } from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");
const observer = new Observer(26.9124, 75.7873, 431);

const p = getPanchangam(birthDate, observer, { timezoneOffset: 330 });

console.log("=== PANCHANGAM FOR 5 FEB 2005 15:00 IST ===");
console.log("tithis:", p.tithis);
console.log("nakshatras:", p.nakshatras);
console.log("yogas:", p.yogas);
console.log("karanas:", p.karanas);
console.log("vara:", p.vara, "dishaShoola varaName:", p.dishaShoola?.varaName);
console.log("paksha:", p.paksha);
console.log("masa:", p.masa);
console.log("ritu:", p.ritu);
console.log("ayana:", p.ayana);
console.log("samvat:", p.samvat);
