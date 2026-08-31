import { calculateCompleteKundli } from "../src/lib/astrology/kundliEngine.ts";

const input = {
  date_of_birth: "2005-02-05",
  birth_time: "15:00",
  birth_time_accuracy: "exact",
  gender: "male",
  place_query: "Jaipur, Rajasthan, India",
  place_label: "Jaipur, Rajasthan, India",
  lat: 26.9124,
  lng: 75.7873,
  elevation: 431,
  timezone_iana: "Asia/Kolkata",
  utc_offset_at_birth: "+05:30",
};

const result = calculateCompleteKundli(input);

console.log("Current Mahadasha:", result.dasha?.currentMahadasha);
console.log("Current Antardasha:", result.dasha?.currentAntardasha);
console.log("Dasha progress %:", result.dasha?.currentMahadasha?.progressPercent);
