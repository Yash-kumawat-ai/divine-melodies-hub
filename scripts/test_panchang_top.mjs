import { Observer, getPanchangam } from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");
const observer = new Observer(26.9124, 75.7873, 431);

const p = getPanchangam(birthDate, observer);
console.log("Tithi:", p.tithi);
console.log("Nakshatra:", p.nakshatra);
console.log("Yoga:", p.yoga);
console.log("Karana:", p.karana);
console.log("Vara:", p.vara);
console.log("Paksha:", p.paksha);
console.log("Masa:", p.masa);
console.log("Ritu:", p.ritu);
console.log("Ayana:", p.ayana);
console.log("Samvat:", p.samvat);
