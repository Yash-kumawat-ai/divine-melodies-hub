import { Observer, getPanchangamDetails } from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");
const observer = new Observer(26.9124, 75.7873, 431);

const pd = getPanchangamDetails(birthDate, observer);
console.log("Tithi:", pd.tithi);
console.log("Nakshatra:", pd.nakshatra);
console.log("Yoga:", pd.yoga);
console.log("Karana:", pd.karana);
console.log("Vara:", pd.vara);
