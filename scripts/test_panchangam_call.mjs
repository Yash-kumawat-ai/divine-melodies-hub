import { Observer, getPanchangam } from "@ishubhamx/panchangam-js";

const birthDate = new Date("2005-02-05T15:00:00+05:30");
const observer = new Observer(26.9124, 75.7873, 431);

const p = getPanchangam(birthDate, observer);
console.log("=== getPanchangam(birthDate, observer) ===");
console.log(JSON.stringify(p, null, 2));
